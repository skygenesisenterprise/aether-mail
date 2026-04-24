const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class OrganizationApiService {
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

  async getOrganization(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/organization");
  }

  async updateOrganization(data: {
    name?: string;
    domain?: string;
    logo_url?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/organization", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getMembers(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request("/api/v1/organization/members");
  }

  async inviteMember(data: { email: string; role?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/organization/invites", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async removeMember(userId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/organization/members/${userId}`, {
      method: "DELETE",
    });
  }

  async getDomains(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request("/api/v1/organization/domains");
  }

  async addDomain(domain: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/organization/domains", {
      method: "POST",
      body: JSON.stringify({ domain }),
    });
  }

  async verifyDomain(domainId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/organization/domains/${domainId}/verify`, {
      method: "POST",
    });
  }
}

export const organizationApi = new OrganizationApiService();