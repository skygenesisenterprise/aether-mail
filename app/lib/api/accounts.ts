const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class AccountsApiService {
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

  async getAccounts(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request("/api/v1/accounts");
  }

  async getAccount(accountId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}`);
  }

  async createAccount(data: {
    email: string;
    name: string;
    password?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAccount(accountId: string, data: {
    name?: string;
    avatar?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(accountId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}`, {
      method: "DELETE",
    });
  }
}

export const accountsApi = new AccountsApiService();