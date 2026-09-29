export interface StatMetric {
  title: str;
  value: string;
  change: string;
  is_positive: boolean;
  comparison: string;
}

export interface OverviewStats {
  total_contacts: StatMetric;
  active_automations: StatMetric;
  total_conversations: StatMetric;
  total_messages: StatMetric;
}

export interface EngagementDataPoint {
  date: string;
  messages: number;
}

export interface AutomationActivityDataPoint {
  date: string;
  executions: number;
}

export interface ConversationStatusDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface AnalyticsData {
  overview: OverviewStats;
  engagement: EngagementDataPoint[];
  automation_activity: AutomationActivityDataPoint[];
  conversation_status: ConversationStatusDataPoint[];
}
