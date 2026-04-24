const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class DriveApiService {
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

  async getFiles(accountId: string, folderId?: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const params = folderId ? `?folderId=${folderId}` : "";
    return this.request(`/api/v1/accounts/${accountId}/files${params}`);
  }

  async getFile(accountId: string, fileId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/files/${fileId}`);
  }

  async uploadFile(data: {
    accountId: string;
    name: string;
    folderId?: string;
    content: Blob;
    contentType: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    const formData = new FormData();
    formData.append("accountId", data.accountId);
    formData.append("name", data.name);
    if (data.folderId) formData.append("folderId", data.folderId);
    formData.append("file", data.content);

    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/api/v1/files`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    return response.json();
  }

  async updateFile(fileId: string, data: { name?: string; folderId?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/files/${fileId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteFile(accountId: string, fileId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/files/${fileId}`, {
      method: "DELETE",
    });
  }

  async getFolders(accountId: string, parentFolderId?: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const params = parentFolderId ? `?parentFolderId=${parentFolderId}` : "";
    return this.request(`/api/v1/accounts/${accountId}/folders${params}`);
  }

  async createFolder(data: { accountId: string; name: string; parentFolderId?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/folders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async shareFile(fileId: string, data: { permission: "view" | "edit"; expiresAt?: string; password?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/files/${fileId}/share`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async downloadFile(accountId: string, fileId: string): Promise<Blob> {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/api/v1/accounts/${accountId}/files/${fileId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    return response.blob();
  }
}

export const driveApi = new DriveApiService();