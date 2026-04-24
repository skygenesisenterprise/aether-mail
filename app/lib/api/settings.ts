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

  async getSettings(accountId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/settings`);
  }

  async updateSettings(accountId: string, data: {
    language?: string;
    timezone?: string;
    dateFormat?: string;
    timeFormat?: string;
    theme?: string;
    displayName?: string;
    signature?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      desktop?: boolean;
      sound?: boolean;
    };
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/settings`, {
      method: "PATCH",
      body: JSON.stringify({ ...data, accountId }),
    });
  }

  async getVacationResponder(accountId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/vacation`);
  }

  async updateVacationResponder(accountId: string, data: {
    enabled: boolean;
    subject?: string;
    message: string;
    startDate?: string;
    endDate?: string;
    contactsOnly?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/vacation`, {
      method: "PUT",
      body: JSON.stringify({ ...data, accountId }),
    });
  }

  async getFilterRules(accountId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/filters`);
  }

  async createFilterRule(data: {
    accountId: string;
    name: string;
    priority: number;
    conditions: any[];
    actions: any[];
    enabled: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/filters", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFilterRule(id: string, data: {
    name?: string;
    priority?: number;
    conditions?: any[];
    actions?: any[];
    enabled?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/filters/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteFilterRule(accountId: string, ruleId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/filters/${ruleId}`, {
      method: "DELETE",
    });
  }
}

export const settingsApi = new SettingsApiService();