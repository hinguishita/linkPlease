from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.contact import ContactOut

class MessageBase(BaseModel):
    content: str = Field(..., min_length=1)

class MessageCreate(MessageBase):
    sender_type: str = Field(default="user") # 'user', 'contact', 'system'

class MessageOut(MessageBase):
    id: int
    conversation_id: int
    sender_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationStatusUpdate(BaseModel):
    status: str # 'open', 'pending', 'closed'

class ConversationOut(BaseModel):
    id: int
    user_id: int
    contact_id: int
    status: str
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    contact: Optional[ContactOut] = None
    messages: List[MessageOut] = []

    class Config:
        from_attributes = True

class ConversationListItem(BaseModel):
    id: int
    user_id: int
    contact_id: int
    status: str
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    contact: Optional[ContactOut] = None
    unread_count: int = 0

    class Config:
        from_attributes = True
