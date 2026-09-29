from pydantic import BaseModel
from typing import List, Dict, Any

class StatMetric(BaseModel):
    title: str
    value: str
    change: str
    is_positive: bool
    comparison: str

class OverviewStatsOut(BaseModel):
    total_contacts: StatMetric
    active_automations: StatMetric
    total_conversations: StatMetric
    total_messages: StatMetric

class EngagementDataPoint(BaseModel):
    date: str
    messages: int

class AutomationActivityDataPoint(BaseModel):
    date: str
    executions: int

class ConversationStatusDataPoint(BaseModel):
    name: str
    value: int
    color: str

class AnalyticsOverview(BaseModel):
    overview: OverviewStatsOut
    engagement: List[EngagementDataPoint]
    automation_activity: List[AutomationActivityDataPoint]
    conversation_status: List[ConversationStatusDataPoint]
