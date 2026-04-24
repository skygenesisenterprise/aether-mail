const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class CalendarApiService {
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

  async getCalendars(accountId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/calendars`);
  }

  async getCalendar(accountId: string, calendarId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/calendars/${calendarId}`);
  }

  async createCalendar(data: { accountId: string; name: string; color?: string; isDefault?: boolean }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/calendars", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCalendar(calendarId: string, data: { name?: string; color?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/calendars/${calendarId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteCalendar(accountId: string, calendarId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/calendars/${calendarId}`, {
      method: "DELETE",
    });
  }

  async getEvents(accountId: string, calendarId: string, start: string, end: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/calendars/${calendarId}/events?start=${start}&end=${end}`);
  }

  async getEvent(accountId: string, eventId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/events/${eventId}`);
  }

  async createEvent(data: {
    accountId: string;
    calendarId: string;
    title: string;
    description?: string;
    start: string;
    end: string;
    allDay?: boolean;
    location?: string;
    attendees?: string[];
    recurrence?: any;
    reminders?: any[];
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEvent(eventId: string, data: {
    title?: string;
    description?: string;
    start?: string;
    end?: string;
    allDay?: boolean;
    location?: string;
    attendees?: string[];
    recurrence?: any;
    reminders?: any[];
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(accountId: string, eventId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/events/${eventId}`, {
      method: "DELETE",
    });
  }
}

export const calendarApi = new CalendarApiService();