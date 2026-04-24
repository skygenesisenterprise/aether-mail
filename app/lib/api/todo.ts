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

  async getTodoLists(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request("/api/v1/task-lists");
  }

  async createTodoList(data: { name: string; color?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/task-lists", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTodos(limit = 50, offset = 0): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request(`/api/v1/tasks?limit=${limit}&offset=${offset}`);
  }

  async getTodo(taskId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/tasks/${taskId}`);
  }

  async createTask(data: {
    title: string;
    todoListId?: string;
    dueDate?: string;
    priority?: string;
    category?: string;
    notes?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: {
    title?: string;
    todoListId?: string;
    dueDate?: string;
    priority?: string;
    category?: string;
    notes?: string;
    completed?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/v1/tasks/${id}`, {
      method: "DELETE",
    });
  }

  async completeTask(id: string, completed = true): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request(`/api/v1/tasks/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({ completed }),
    });
  }
}

export const todoApi = new TodoApiService();