from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.schemas.inbox import ConversationOut, ConversationListItem, MessageCreate, MessageOut, ConversationStatusUpdate
from app.services.inbox_service import InboxService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/inbox", tags=["Inbox"])

@router.get("/conversations", response_model=List[ConversationOut])
def get_conversations(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return InboxService.get_conversations(db, current_user.id, search=search, status=status)

@router.get("/conversations/{conversation_id}", response_model=ConversationOut)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = InboxService.get_conversation(db, conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.post("/conversations/{conversation_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def send_message(
    conversation_id: int,
    message_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = InboxService.send_message(db, conversation_id, current_user.id, message_in)
    if not message:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return message

@router.patch("/conversations/{conversation_id}/status", response_model=ConversationOut)
def update_conversation_status(
    conversation_id: int,
    status_in: ConversationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = InboxService.update_status(db, conversation_id, current_user.id, status_in.status)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation
