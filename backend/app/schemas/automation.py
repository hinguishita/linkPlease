from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AutomationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    trigger_type: str = Field(..., min_length=2, max_length=50)
    condition: Optional[str] = None
    action_type: str = Field(..., min_length=2, max_length=50)
    action_value: Optional[str] = None
    status: str = Field(default="active")

class AutomationCreate(AutomationBase):
    pass

class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_type: Optional[str] = None
    condition: Optional[str] = None
    action_type: Optional[str] = None
    action_value: Optional[str] = None
    status: Optional[str] = None

class AutomationStatusUpdate(BaseModel):
    status: str

class AutomationOut(AutomationBase):
    id: int
    user_id: int
    execution_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
