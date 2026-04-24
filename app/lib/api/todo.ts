const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class TodoApiService {
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

  async getTaskLists(accountId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/task-lists`);
  }

  async createTaskList(data: { accountId: string; name: string; color?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/task-lists", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTaskList(id: string, data: { name?: string; color?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/task-lists/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTaskList(accountId: string, listId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/task-lists/${listId}`, {
      method: "DELETE",
    });
  }

  async getTasks(accountId: string, listId?: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const params = listId ? `?listId=${listId}` : "";
    return this.request(`/api/v1/accounts/${accountId}/tasks${params}`);
  }

  async getTask(accountId: string, taskId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/tasks/${taskId}`);
  }

  async createTask(data: {
    accountId: string;
    listId?: string;
    title: string;
    description?: string;
    dueDate?: string;
    priority?: "low" | "medium" | "high";
    tags?: string[];
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: "low" | "medium" | "high";
    tags?: string[];
    completed?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(accountId: string, taskId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/tasks/${taskId}`, {
      method: "DELETE",
    });
  }

  async completeTask(accountId: string, taskId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/tasks/${taskId}/complete`, {
      method: "POST",
    });
  }

  async uncompleteTask(accountId: string, taskId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/accounts/${accountId}/tasks/${taskId}/uncomplete`, {
      method: "POST",
    });
  }
}

export const todoApi = new TodoApiService();