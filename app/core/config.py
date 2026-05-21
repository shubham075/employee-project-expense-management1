from functools import lru_cache
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = PROJECT_ROOT / ".env"

load_dotenv(ENV_FILE)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        env_ignore_empty=True,
    )

    app_name: str = "Employee Project & Expense Management System"
    environment: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    database_url: str | None = None
    db_server: str | None = None
    db_name: str | None = None
    db_user: str | None = None
    db_password: str | None = None
    db_driver: str = "ODBC Driver 17 for SQL Server"
    db_trust_server_certificate: bool = True

    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    password_reset_token_expire_minutes: int = 30
    frontend_reset_password_url: str = "http://localhost:5173/reset-password"

    upload_dir: Path = Path("uploads")
    max_upload_size_mb: int = 10
    allowed_upload_extensions: set[str] = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}

    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    log_level: str = "INFO"

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_url:
            return self.database_url

        missing = [
            name
            for name, value in (
                ("DB_SERVER", self.db_server),
                ("DB_NAME", self.db_name),
                ("DB_DRIVER", self.db_driver),
            )
            if not value
        ]
        if missing:
            raise RuntimeError(f"Missing database environment variables: {', '.join(missing)}")

        driver = self.db_driver or "ODBC Driver 17 for SQL Server"
        if not driver.startswith("{"):
            driver = f"{{{driver}}}"

        conn_parts = [
            f"DRIVER={driver}",
            f"SERVER={self.db_server}",
            f"DATABASE={self.db_name}",
        ]

        if self.db_password:
            if not self.db_user:
                raise RuntimeError("DB_USER is required when DB_PASSWORD is set")
            conn_parts.extend([f"UID={self.db_user}", f"PWD={self.db_password}"])
        else:
            conn_parts.append("Trusted_Connection=yes")

        if self.db_trust_server_certificate:
            conn_parts.append("TrustServerCertificate=yes")

        params = quote_plus(";".join(conn_parts))
        return f"mssql+pyodbc:///?odbc_connect={params}"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
