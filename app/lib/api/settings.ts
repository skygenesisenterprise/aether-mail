const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class SettingsApiService {
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

  async getSettings(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/settings");
  }

  async updateSettings(data: {
    theme?: string;
    language?: string;
    emailView?: string;
    emailSort?: string;
    contactsSort?: string;
    calendarView?: string;
    todoView?: string;
    sidebarCollapsed?: boolean;
    desktopNotifications?: boolean;
    emailNotifications?: boolean;
    calendarNotifications?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getVacationResponder(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/settings/vacation");
  }

  async updateVacationResponder(data: {
    enabled?: boolean;
    subject?: string;
    message?: string;
    startDate?: string;
    endDate?: string;
    contactsOnly?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/settings/vacation", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getFilters(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request("/api/v1/filters");
  }

  async createFilter(data: {
    name: string;
    conditions: string;
    actions: string;
    priority?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/filters", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFilter(id: string, data: {
    name?: string;
    conditions?: string;
    actions?: string;
    enabled?: boolean;
    priority?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/filters/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteFilter(ruleId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/filters/${ruleId}`, {
      method: "DELETE",
    });
  }

  async getLabels(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request("/api/v1/labels");
  }

  async createLabel(data: {
    name: string;
    color?: string;
    parentId?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/labels", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateLabel(id: string, data: {
    name?: string;
    color?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/labels/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteLabel(id: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/labels/${id}`, {
      method: "DELETE",
    });
  }

  async getSignatures(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request("/api/v1/account/signatures");
  }

  async createSignature(data: {
    name: string;
    content: string;
    html?: string;
    isDefault?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/account/signatures", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSignature(id: string, data: {
    name?: string;
    content?: string;
    html?: string;
    isDefault?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/account/signatures/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteSignature(id: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/account/signatures/${id}`, {
      method: "DELETE",
    });
  }
}

export const settingsApi = new SettingsApiService();