from sqlalchemy.orm import Session
from app.models.automation import Automation
from app.schemas.automation import AutomationCreate, AutomationUpdate
from typing import List, Optional

class AutomationService:
    @staticmethod
    def get_automations(db: Session, user_id: int) -> List[Automation]:
        return db.query(Automation).filter(Automation.user_id == user_id).order_by(Automation.created_at.desc()).all()

    @staticmethod
    def get_automation(db: Session, automation_id: int, user_id: int) -> Optional[Automation]:
        return db.query(Automation).filter(Automation.id == automation_id, Automation.user_id == user_id).first()

    @staticmethod
    def create_automation(db: Session, user_id: int, data: AutomationCreate) -> Automation:
        automation = Automation(
            user_id=user_id,
            name=data.name,
            description=data.description,
            trigger_type=data.trigger_type,
            condition=data.condition,
            action_type=data.action_type,
            action_value=data.action_value,
            status=data.status
        )
        db.add(automation)
        db.commit()
        db.refresh(automation)
        return automation

    @staticmethod
    def update_automation(db: Session, automation_id: int, user_id: int, data: AutomationUpdate) -> Optional[Automation]:
        automation = AutomationService.get_automation(db, automation_id, user_id)
        if not automation:
            return None
        
        update_data = data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(automation, key, value)
        
        db.commit()
        db.refresh(automation)
        return automation

    @staticmethod
    def update_status(db: Session, automation_id: int, user_id: int, status: str) -> Optional[Automation]:
        automation = AutomationService.get_automation(db, automation_id, user_id)
        if not automation:
            return None
        automation.status = status
        db.commit()
        db.refresh(automation)
        return automation

    @staticmethod
    def delete_automation(db: Session, automation_id: int, user_id: int) -> bool:
        automation = AutomationService.get_automation(db, automation_id, user_id)
        if not automation:
            return False
        db.delete(automation)
        db.commit()
        return True
