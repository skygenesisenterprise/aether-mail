export type EventStatus = "success" | "failed" | "warning" | "info";

export type ActivityEventType =
  | "user.login"
  | "user.logout"
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "token.issued"
  | "token.revoked"
  | "token.refreshed"
  | "api.request"
  | "security.alert"
  | "security.blocked"
  | "agent.executed"
  | "agent.failed"
  | "vault.secret.accessed"
  | "vault.secret.denied"
  | "vault.secret.created"
  | "vault.secret.deleted"
  | "application.created"
  | "application.updated"
  | "connection.created"
  | "connection.deleted";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  description: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  application?: {
    id: string;
    name: string;
  };
  timestamp: Date;
  status: EventStatus;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  device?: string;
  userAgent?: string;
  traceId?: string;
  requestId?: string;
  duration?: number;
  statusCode?: number;
}

export interface ActivityFilters {
  type?: ActivityEventType;
  dateRange?: {
    from: Date;
    to: Date;
  };
  user?: string;
  application?: string;
  status?: EventStatus;
}

export interface ActivityState {
  events: ActivityEvent[];
  loading: boolean;
  error: string | null;
  search: string;
  filters: ActivityFilters;
  selectedEvent: ActivityEvent | null;
  drawerOpen: boolean;
  page: number;
  pageSize: number;
  hasMore: boolean;
  autoRefresh: boolean;
}

export type ActivityAction =
  | { type: "SET_EVENTS"; payload: ActivityEvent[] }
  | { type: "APPEND_EVENTS"; payload: ActivityEvent[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_FILTERS"; payload: ActivityFilters }
  | { type: "RESET_FILTERS" }
  | { type: "SELECT_EVENT"; payload: ActivityEvent | null }
  | { type: "SET_DRAWER_OPEN"; payload: boolean }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "SET_HAS_MORE"; payload: boolean }
  | { type: "SET_AUTO_REFRESH"; payload: boolean };

export const EVENT_TYPE_LABELS: Record<ActivityEventType, string> = {
  "user.login": "User Login",
  "user.logout": "User Logout",
  "user.created": "User Created",
  "user.updated": "User Updated",
  "user.deleted": "User Deleted",
  "token.issued": "Token Issued",
  "token.revoked": "Token Revoked",
  "token.refreshed": "Token Refreshed",
  "api.request": "API Request",
  "security.alert": "Security Alert",
  "security.blocked": "Security Blocked",
  "agent.executed": "Agent Executed",
  "agent.failed": "Agent Failed",
  "vault.secret.accessed": "Secret Accessed",
  "vault.secret.denied": "Secret Denied",
  "vault.secret.created": "Secret Created",
  "vault.secret.deleted": "Secret Deleted",
  "application.created": "Application Created",
  "application.updated": "Application Updated",
  "connection.created": "Connection Created",
  "connection.deleted": "Connection Deleted",
};

export const STATUS_COLORS: Record<EventStatus, string> = {
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};
