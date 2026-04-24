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

  async getCalendars(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request("/api/v1/calendars");
  }

  async getCalendar(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/calendars/${id}`);
  }

  async createCalendar(data: { name: string; color?: string; description?: string; isDefault?: boolean }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/calendars", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCalendar(id: string, data: { name?: string; color?: string; description?: string; isDefault?: boolean }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/calendars/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteCalendar(id: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/calendars/${id}`, {
      method: "DELETE",
    });
  }

  async getEvents(calendarId?: string, start?: string, end?: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const params = new URLSearchParams();
    if (calendarId) params.set("calendarId", calendarId);
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    return this.request(`/api/v1/calendars/events?${params}`);
  }

  async getEvent(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/calendars/events/${id}`);
  }

  async createEvent(data: {
    calendarId?: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    allDay?: boolean;
    location?: string;
    recurring?: string;
    color?: string;
    reminders?: string;
    attendees?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/calendars/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: string, data: {
    calendarId?: string;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    allDay?: boolean;
    location?: string;
    recurring?: string;
    color?: string;
    reminders?: string;
    attendees?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/calendars/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/calendars/events/${id}`, {
      method: "DELETE",
    });
  }
}

export const calendarApi = new CalendarApiService();