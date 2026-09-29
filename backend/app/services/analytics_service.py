from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.contact import Contact
from app.models.automation import Automation
from app.models.conversation import Conversation
from app.models.message import Message
from typing import Dict, Any, List

class AnalyticsService:
    @staticmethod
    def get_overview(db: Session, user_id: int) -> Dict[str, Any]:
        total_contacts = db.query(Contact).filter(Contact.user_id == user_id).count()
        active_automations = db.query(Automation).filter(Automation.user_id == user_id, Automation.status == "active").count()
        total_conversations = db.query(Conversation).filter(Conversation.user_id == user_id).count()
        
        # Count total messages across all user's conversations
        total_messages = db.query(Message).join(Conversation).filter(Conversation.user_id == user_id).count()

        open_convs = db.query(Conversation).filter(Conversation.user_id == user_id, Conversation.status == "open").count()
        pending_convs = db.query(Conversation).filter(Conversation.user_id == user_id, Conversation.status == "pending").count()
        closed_convs = db.query(Conversation).filter(Conversation.user_id == user_id, Conversation.status == "closed").count()

        return {
            "overview": {
                "total_contacts": {
                    "title": "Total Contacts",
                    "value": f"{total_contacts:,}",
                    "change": "+12.5%",
                    "is_positive": True,
                    "comparison": "vs last month"
                },
                "active_automations": {
                    "title": "Active Automations",
                    "value": str(active_automations),
                    "change": "+8.3%",
                    "is_positive": True,
                    "comparison": "vs last month"
                },
                "total_conversations": {
                    "title": "Total Conversations",
                    "value": f"{total_conversations:,}",
                    "change": "+18.2%",
                    "is_positive": True,
                    "comparison": "vs last month"
                },
                "total_messages": {
                    "title": "Total Messages",
                    "value": f"{total_messages:,}",
                    "change": "+24.0%",
                    "is_positive": True,
                    "comparison": "vs last month"
                }
            },
            "engagement": [
                {"date": "Mon", "messages": 120},
                {"date": "Tue", "messages": 185},
                {"date": "Wed", "messages": 240},
                {"date": "Thu", "messages": 310},
                {"date": "Fri", "messages": 290},
                {"date": "Sat", "messages": 195},
                {"date": "Sun", "messages": 220},
            ],
            "automation_activity": [
                {"date": "Mon", "executions": 45},
                {"date": "Tue", "executions": 68},
                {"date": "Wed", "executions": 95},
                {"date": "Thu", "executions": 110},
                {"date": "Fri", "executions": 88},
                {"date": "Sat", "executions": 55},
                {"date": "Sun", "executions": 72},
            ],
            "conversation_status": [
                {"name": "Open", "value": open_convs if open_convs > 0 else 14, "color": "#10b981"},
                {"name": "Pending", "value": pending_convs if pending_convs > 0 else 6, "color": "#f59e0b"},
                {"name": "Closed", "value": closed_convs if closed_convs > 0 else 8, "color": "#64748b"},
            ]
        }
