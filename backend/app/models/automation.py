from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Automation(Base):
    __tablename__ = "automations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    trigger_type = Column(String(50), nullable=False)  # e.g., 'new_message', 'keyword_match', 'new_follower'
    condition = Column(String(255), nullable=True)     # e.g., 'contains "price"', 'platform == "Instagram"'
    action_type = Column(String(50), nullable=False)   # e.g., 'send_reply', 'add_tag', 'notify_email'
    action_value = Column(Text, nullable=True)         # e.g., reply content
    status = Column(String(20), default="active", nullable=False) # 'active', 'paused', 'draft'
    execution_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="automations")
