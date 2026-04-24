export type ActivityPriority = "low" | "medium" | "high" | "urgent";
export type ActivitySourceModule =
  | "inbox"
  | "calendar"
  | "chat"
  | "meet"
  | "todo"
  | "drive"
  | "automation"
  | "organization"
  | "copilot";

export type ActivityType =
  | "email_received"
  | "email_replied"
  | "email_sent"
  | "email_draft_created"
  | "event_created"
  | "event_updated"
  | "event_deleted"
  | "meeting_scheduled"
  | "meeting_started"
  | "meeting_ended"
  | "message_sent"
  | "message_received"
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "task_deleted"
  | "file_uploaded"
  | "file_downloaded"
  | "file_shared"
  | "file_deleted"
  | "folder_created"
  | "automation_triggered"
  | "automation_failed"
  | "copilot_action"
  | "copilot_suggestion"
  | "member_joined"
  | "member_left"
  | "domain_verified"
  | "settings_changed"
  | "security_alert";

export interface ActivityRelatedEntity {
  id: string;
  type: "email" | "event" | "task" | "file" | "folder" | "user" | "automation" | "message";
  name?: string;
  url?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  sourceModule: ActivitySourceModule;
  priority: ActivityPriority;
  relatedEntities?: ActivityRelatedEntity[];
  metadata?: Record<string, unknown>;
  isRead?: boolean;
}

export interface ActivityGroup {
  id: string;
  title: string;
  activities: Activity[];
  timestamp: string;
}

export interface ActivityFeedResponse {
  success: boolean;
  data?: {
    activities: Activity[];
    groups?: ActivityGroup[];
    copilotActions?: Activity[];
  };
  error?: string;
}

export interface ActivityFilters {
  sourceModules?: ActivitySourceModule[];
  types?: ActivityType[];
  priority?: ActivityPriority[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}