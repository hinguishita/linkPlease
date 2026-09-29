from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.automation import Automation
from app.schemas.inbox import MessageCreate
from typing import List, Optional
from datetime import datetime

class InboxService:
    @staticmethod
    def get_conversations(db: Session, user_id: int, search: Optional[str] = None, status: Optional[str] = None) -> List[Conversation]:
        query = db.query(Conversation).filter(Conversation.user_id == user_id)
        if status and status.lower() != "all":
            query = query.filter(Conversation.status == status)
        
        conversations = query.order_by(Conversation.last_message_at.desc()).all()
        
        if search:
            search_lower = search.lower()
            conversations = [
                c for c in conversations 
                if (c.contact and (search_lower in c.contact.name.lower() or (c.contact.username and search_lower in c.contact.username.lower())))
                or (c.last_message and search_lower in c.last_message.lower())
            ]
        return conversations

    @staticmethod
    def get_conversation(db: Session, conversation_id: int, user_id: int) -> Optional[Conversation]:
        return db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == user_id).first()

    @staticmethod
    def send_message(db: Session, conversation_id: int, user_id: int, data: MessageCreate) -> Optional[Message]:
        conversation = InboxService.get_conversation(db, conversation_id, user_id)
        if not conversation:
            return None

        new_msg = Message(
            conversation_id=conversation_id,
            sender_type=data.sender_type,
            content=data.content,
            is_read=True if data.sender_type == "user" else False
        )
        db.add(new_msg)

        conversation.last_message = data.content
        conversation.last_message_at = datetime.utcnow()
        if conversation.contact:
            conversation.contact.last_interaction = datetime.utcnow()

        db.commit()
        db.refresh(new_msg)

        # Trigger active automation check if sender is user or contact
        if data.sender_type in ["user", "contact"]:
            InboxService._check_and_trigger_automation(db, conversation, data.content)

        return new_msg

    @staticmethod
    def _check_and_trigger_automation(db: Session, conversation: Conversation, message_text: str):
        active_automations = db.query(Automation).filter(
            Automation.user_id == conversation.user_id,
            Automation.status == "active"
        ).all()

        text_lower = message_text.lower()
        for auto in active_automations:
            triggered = False
            if auto.trigger_type in ["new_message", "keyword_match"]:
                if auto.condition:
                    cond_clean = auto.condition.replace('contains "', '').replace('"', '').lower()
                    if cond_clean in text_lower:
                        triggered = True
                else:
                    triggered = True

            if triggered and auto.action_value:
                # Execute action: send automated reply
                reply_msg = Message(
                    conversation_id=conversation.id,
                    sender_type="system",
                    content=f"[Automation: {auto.name}] {auto.action_value}",
                    is_read=True
                )
                db.add(reply_msg)
                auto.execution_count += 1
                conversation.last_message = reply_msg.content
                conversation.last_message_at = datetime.utcnow()
                db.commit()
                break

    @staticmethod
    def update_status(db: Session, conversation_id: int, user_id: int, status: str) -> Optional[Conversation]:
        conversation = InboxService.get_conversation(db, conversation_id, user_id)
        if not conversation:
            return None
        conversation.status = status
        db.commit()
        db.refresh(conversation)
        return conversation
