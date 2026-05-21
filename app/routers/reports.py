from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.rbac import ADMIN, MANAGER, require_roles
from app.core.database import get_db
from app.schemas.common import APIResponse
from app.schemas.report import DashboardSummary, ExpenseReportRow, ProjectReportRow
from app.services.report import ReportService
from app.utils.responses import success_response

router = APIRouter(tags=["Reports"], dependencies=[Depends(require_roles(ADMIN, MANAGER))])


@router.get("/dashboard/summary", response_model=APIResponse[DashboardSummary])
def dashboard_summary(db: Session = Depends(get_db)):
    data = ReportService(db).dashboard_summary()
    return success_response(data)


@router.get("/reports/expenses", response_model=APIResponse[list[ExpenseReportRow]])
def expense_report(db: Session = Depends(get_db)):
    data = ReportService(db).expense_report()
    return success_response(data)


@router.get("/reports/projects", response_model=APIResponse[list[ProjectReportRow]])
def project_report(db: Session = Depends(get_db)):
    data = ReportService(db).project_report()
    return success_response(data)
