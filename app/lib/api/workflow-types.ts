export type WorkflowStatus = "active" | "inactive" | "draft" | "error";
export type TriggerType = "email" | "calendar" | "task" | "schedule" | "manual" | "webhook";
export type ActionType = "send_email" | "forward_email" | "auto_reply" | "create_task" | "create_event" | "send_notification" | "webhook_call" | "add_label" | "move_email";
export type ExecutionStatus = "success" | "failed" | "running" | "pending";

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  name: string;
  description: string;
  config: Record<string, unknown>;
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  name: string;
  description: string;
  config: Record<string, unknown>;
}

export interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition" | "delay";
  data: WorkflowTrigger | WorkflowAction | null;
  position: { x: number; y: number };
}

export interface WorkflowConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  error?: string;
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error";
  message: string;
  details?: Record<string, unknown>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  workflow: Omit<Workflow, "id" | "createdAt" | "updatedAt" | "executionCount" | "successCount" | "failureCount">;
}

export interface WorkflowFilters {
  status?: WorkflowStatus;
  triggerType?: TriggerType;
  search?: string;
}

export interface WorkflowResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const TRIGGER_TYPES: { type: TriggerType; name: string; icon: string; description: string }[] = [
  { type: "email", name: "Email", icon: "Mail", description: "When a new email is received" },
  { type: "calendar", name: "Calendar", icon: "Calendar", description: "When a calendar event occurs" },
  { type: "task", name: "Task", icon: "CheckSquare", description: "When a task status changes" },
  { type: "schedule", name: "Schedule", icon: "Clock", description: "Run on a schedule (cron)" },
  { type: "manual", name: "Manual", icon: "Play", description: "Run manually" },
  { type: "webhook", name: "Webhook", icon: "Webhook", description: "Triggered by external webhook" },
];

export const ACTION_TYPES: { type: ActionType; name: string; icon: string; description: string }[] = [
  { type: "send_email", name: "Send Email", icon: "Send", description: "Send an email" },
  { type: "forward_email", name: "Forward Email", icon: "Forward", description: "Forward the email" },
  { type: "auto_reply", name: "Auto Reply", icon: "Bot", description: "Send an automatic reply" },
  { type: "create_task", name: "Create Task", icon: "ListTodo", description: "Create a new task" },
  { type: "create_event", name: "Create Event", icon: "CalendarPlus", description: "Create a calendar event" },
  { type: "send_notification", name: "Send Notification", icon: "Bell", description: "Send a notification" },
  { type: "webhook_call", name: "Webhook", icon: "Webhook", description: "Call an external webhook" },
  { type: "add_label", name: "Add Label", icon: "Tag", description: "Add a label to the email" },
  { type: "move_email", name: "Move Email", icon: "FolderInput", description: "Move email to folder" },
];