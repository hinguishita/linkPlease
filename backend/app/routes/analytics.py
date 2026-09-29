from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.analytics import AnalyticsOverview
from app.services.analytics_service import AnalyticsService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnalyticsService.get_overview(db, current_user.id)

@router.get("/messages")
def get_analytics_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    overview = AnalyticsService.get_overview(db, current_user.id)
    return {"engagement": overview["engagement"]}

@router.get("/contacts")
def get_analytics_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    overview = AnalyticsService.get_overview(db, current_user.id)
    return {"contact_growth": overview["engagement"]}

@router.get("/automations")
def get_analytics_automations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    overview = AnalyticsService.get_overview(db, current_user.id)
    return {"automation_activity": overview["automation_activity"]}
