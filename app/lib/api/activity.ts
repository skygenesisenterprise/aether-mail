import type { Activity, ActivityFeedResponse, ActivityFilters } from "./activity-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class ActivityApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("accessToken");
    if (!token || token === "undefined" || token === "null") {
      return null;
    }
    return token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    if (!token) {
      throw new Error("Not authenticated");
    }

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  async getActivities(filters: ActivityFilters = {}): Promise<ActivityFeedResponse> {
    const params = new URLSearchParams();
    if (filters.sourceModules?.length) params.set("modules", filters.sourceModules.join(","));
    if (filters.types?.length) params.set("types", filters.types.join(","));
    if (filters.priority?.length) params.set("priority", filters.priority.join(","));
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.offset) params.set("offset", filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `/api/v1/activity${queryString ? `?${queryString}` : ""}`;

    return this.request<ActivityFeedResponse>(endpoint);
  }

  async markAsRead(activityId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/activity/${activityId}/read`, {
      method: "POST",
    });
  }

  async markAllAsRead(): Promise<{ success: boolean; error?: string }> {
    return this.request("/api/v1/activity/read-all", {
      method: "POST",
    });
  }

  normalizeActivity(raw: Record<string, unknown>): Activity {
    return {
      id: String(raw.id || ""),
      type: String(raw.type || "unknown") as Activity["type"],
      title: String(raw.title || ""),
      description: raw.description ? String(raw.description) : undefined,
      timestamp: String(raw.timestamp || raw.createdAt || new Date().toISOString()),
      sourceModule: String(raw.sourceModule || raw.module || "inbox") as Activity["sourceModule"],
      priority: String(raw.priority || "medium") as Activity["priority"],
      relatedEntities: raw.relatedEntities as Activity["relatedEntities"],
      metadata: raw.metadata as Activity["metadata"],
      isRead: raw.isRead as boolean | undefined,
    };
  }

  normalizeActivities(rawActivities: Record<string, unknown>[]): Activity[] {
    return rawActivities.map((raw) => this.normalizeActivity(raw));
  }

  groupActivitiesByDate(activities: Activity[]): Map<string, Activity[]> {
    const groups = new Map<string, Activity[]>();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    activities.forEach((activity) => {
      const activityDate = new Date(activity.timestamp);
      let dateKey: string;

      if (activityDate >= today) {
        dateKey = "Today";
      } else if (activityDate >= yesterday) {
        dateKey = "Yesterday";
      } else if (activityDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        dateKey = "This Week";
      } else if (activityDate >= new Date(today.getFullYear(), activityDate.getMonth(), 1)) {
        dateKey = "This Month";
      } else {
        dateKey = "Older";
      }

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(activity);
    });

    return groups;
  }

  sortByPriority(activities: Activity[]): Activity[] {
    const priorityOrder: Record<Activity["priority"], number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return [...activities].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  extractCopilotActions(activities: Activity[]): Activity[] {
    return activities.filter(
      (a) => a.sourceModule === "copilot" || a.type.startsWith("copilot_")
    );
  }

  filterNonCopilot(activities: Activity[]): Activity[] {
    return activities.filter(
      (a) => a.sourceModule !== "copilot" && !a.type.startsWith("copilot_")
    );
  }
}

export const activityApi = new ActivityApiService();