export type AutomationStatus = "active" | "paused" | "draft";

export interface Automation {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  trigger_type: string;
  condition?: string;
  action_type: string;
  action_value?: string;
  status: AutomationStatus;
  execution_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAutomationPayload {
  name: string;
  description?: string;
  trigger_type: string;
  condition?: string;
  action_type: string;
  action_value?: string;
  status?: AutomationStatus;
}

export interface UpdateAutomationPayload {
  name?: string;
  description?: string;
  trigger_type?: string;
  condition?: string;
  action_type?: string;
  action_value?: string;
  status?: AutomationStatus;
}
