from sqlalchemy.orm import Session
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactUpdate
from typing import List, Optional
from datetime import datetime

class ContactService:
    @staticmethod
    def get_contacts(db: Session, user_id: int, search: Optional[str] = None, platform: Optional[str] = None) -> List[Contact]:
        query = db.query(Contact).filter(Contact.user_id == user_id)
        if search:
            query = query.filter(
                (Contact.name.ilike(f"%{search}%")) |
                (Contact.username.ilike(f"%{search}%")) |
                (Contact.email.ilike(f"%{search}%"))
            )
        if platform and platform.lower() != "all":
            query = query.filter(Contact.platform.ilike(platform))
        return query.order_by(Contact.created_at.desc()).all()

    @staticmethod
    def get_contact(db: Session, contact_id: int, user_id: int) -> Optional[Contact]:
        return db.query(Contact).filter(Contact.id == contact_id, Contact.user_id == user_id).first()

    @staticmethod
    def create_contact(db: Session, user_id: int, data: ContactCreate) -> Contact:
        contact = Contact(
            user_id=user_id,
            name=data.name,
            username=data.username,
            email=data.email,
            phone=data.phone,
            platform=data.platform,
            avatar=data.avatar,
            tags=data.tags,
            last_interaction=datetime.utcnow()
        )
        db.add(contact)
        db.commit()
        db.refresh(contact)
        return contact

    @staticmethod
    def update_contact(db: Session, contact_id: int, user_id: int, data: ContactUpdate) -> Optional[Contact]:
        contact = ContactService.get_contact(db, contact_id, user_id)
        if not contact:
            return None
        
        update_data = data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(contact, key, value)
        
        db.commit()
        db.refresh(contact)
        return contact

    @staticmethod
    def delete_contact(db: Session, contact_id: int, user_id: int) -> bool:
        contact = ContactService.get_contact(db, contact_id, user_id)
        if not contact:
            return False
        db.delete(contact)
        db.commit()
        return True
