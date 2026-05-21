# Employee Project & Expense Management System

Production-oriented FastAPI backend using SQLAlchemy ORM, SQL Server, JWT authentication, RBAC, Alembic, Pydantic v2, bcrypt, multipart uploads, and dotenv configuration.

## Folder Structure

```text
app/
  auth/            JWT, password hashing, RBAC guards
  core/            settings, database, logging, exception handlers
  dependencies/    auth and pagination dependency injection
  middleware/      request logging
  models/          SQLAlchemy ORM models
  repositories/    data access layer
  routers/         FastAPI route layer
  schemas/         Pydantic request/response contracts
  services/        business logic layer
  utils/           files, pagination, responses, notifications
uploads/           uploaded bill files
alembic/           migrations
docs/              API notes, SQL samples, Postman collection
```

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Install Microsoft ODBC Driver 17 or 18 for SQL Server and update the SQL Server values in `.env`.

Example for Windows authentication:

```env
DB_DRIVER="ODBC Driver 17 for SQL Server"
DB_SERVER="BIFROST\\SQLEXPRESS"
DB_NAME="employee_management"
DB_USER=""
DB_PASSWORD=""
DB_TRUST_SERVER_CERTIFICATE=true
```

The backend uses synchronous SQLAlchemy `Session`, so it builds a `mssql+pyodbc` URL internally. If you choose to set `DATABASE_URL` directly, use `mssql+pyodbc`.

## Database

Create the database:

```sql
CREATE DATABASE employee_management;
```

Generate and apply migrations:

```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

Seed roles with `docs/sample_sql.sql`.

## Run

```bash
uvicorn app.main:app --reload
```

Open Swagger at `http://localhost:8000/docs`.

## Architecture

Request flow:

```text
Router Layer -> Service Layer -> Repository Layer -> Database Layer
```

Routes only validate HTTP input and select dependencies. Services hold business rules. Repositories own query construction and persistence. Models define database tables. Schemas define API contracts.

## Roles

| Role | Capabilities |
| --- | --- |
| Admin | Manage users, roles, projects, tasks, reports |
| Manager | Manage projects/tasks, approve or reject expenses, reports |
| Employee | Update own task status, add expenses, upload bills |

## Security

- Bcrypt password hashing
- JWT access and refresh tokens
- Refresh-token session records and logout revocation
- Password reset tokens with expiry and one-time use
- Role-based route guards
- Soft deletes for business records
- Validated upload extensions and max upload size
- CORS configured for React + Vite
- Centralized exception handling and request logging

## API Docs

See [docs/API.md](docs/API.md), [docs/sample_sql.sql](docs/sample_sql.sql), and [docs/postman_collection.json](docs/postman_collection.json).
