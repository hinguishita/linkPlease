from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.schemas.contact import ContactCreate, ContactUpdate, ContactOut
from app.services.contact_service import ContactService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/contacts", tags=["Contacts"])

@router.get("", response_model=List[ContactOut])
def get_contacts(
    search: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ContactService.get_contacts(db, current_user.id, search=search, platform=platform)

@router.post("", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact_in: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ContactService.create_contact(db, current_user.id, contact_in)

@router.get("/{contact_id}", response_model=ContactOut)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contact = ContactService.get_contact(db, contact_id, current_user.id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.put("/{contact_id}", response_model=ContactOut)
def update_contact(
    contact_id: int,
    contact_in: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contact = ContactService.update_contact(db, contact_id, current_user.id, contact_in)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = ContactService.delete_contact(db, contact_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return None
