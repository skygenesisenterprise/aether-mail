const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class ContactsApiService {
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

  async getContacts(accountId: string, limit: number = 50, offset: number = 0): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/contacts?limit=${limit}&offset=${offset}`);
  }

  async getContact(accountId: string, contactId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/contacts/${contactId}`);
  }

  async createContact(data: {
    accountId: string;
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    address?: string;
    notes?: string;
    groups?: string[];
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateContact(id: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    address?: string;
    notes?: string;
    groups?: string[];
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteContact(accountId: string, contactId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/contacts/${contactId}`, {
      method: "DELETE",
    });
  }

  async searchContacts(accountId: string, query: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/contacts/search", {
      method: "POST",
      body: JSON.stringify({ accountId, query }),
    });
  }

  async getContactGroups(accountId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/contact-groups`);
  }

  async createContactGroup(data: { accountId: string; name: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/contact-groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateContactGroup(id: string, data: { name: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/contact-groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteContactGroup(accountId: string, groupId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/contact-groups/${groupId}`, {
      method: "DELETE",
    });
  }

  async getTags(accountId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/tags`);
  }

  async createTag(data: { accountId: string; name: string; color?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/tags", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTag(id: string, data: { name?: string; color?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/tags/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTag(accountId: string, tagId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/tags/${tagId}`, {
      method: "DELETE",
    });
  }
}

export const contactsApi = new ContactsApiService();