from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    platform: str = Field(default="Instagram")
    avatar: Optional[str] = None
    tags: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    platform: Optional[str] = None
    avatar: Optional[str] = None
    tags: Optional[str] = None

class ContactOut(ContactBase):
    id: int
    user_id: int
    last_interaction: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
