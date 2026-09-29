from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.automation import AutomationCreate, AutomationUpdate, AutomationOut, AutomationStatusUpdate
from app.services.automation_service import AutomationService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/automations", tags=["Automations"])

@router.get("", response_model=List[AutomationOut])
def get_automations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AutomationService.get_automations(db, current_user.id)

@router.post("", response_model=AutomationOut, status_code=status.HTTP_201_CREATED)
def create_automation(
    automation_in: AutomationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AutomationService.create_automation(db, current_user.id, automation_in)

@router.get("/{automation_id}", response_model=AutomationOut)
def get_automation(
    automation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    automation = AutomationService.get_automation(db, automation_id, current_user.id)
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    return automation

@router.put("/{automation_id}", response_model=AutomationOut)
def update_automation(
    automation_id: int,
    automation_in: AutomationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    automation = AutomationService.update_automation(db, automation_id, current_user.id, automation_in)
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    return automation

@router.patch("/{automation_id}/status", response_model=AutomationOut)
def update_automation_status(
    automation_id: int,
    status_in: AutomationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    automation = AutomationService.update_status(db, automation_id, current_user.id, status_in.status)
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    return automation

@router.delete("/{automation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_automation(
    automation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = AutomationService.delete_automation(db, automation_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Automation not found")
    return None
