import type { Workflow, WorkflowExecution, WorkflowTemplate, WorkflowFilters, WorkflowResponse } from "./workflow-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class WorkflowApiService {
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

  async getWorkflows(filters?: WorkflowFilters): Promise<WorkflowResponse<Workflow[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.triggerType) params.set("triggerType", filters.triggerType);
    if (filters?.search) params.set("search", filters.search);
    
    const queryString = params.toString();
    return this.request<WorkflowResponse<Workflow[]>>(`/api/v1/workflows${queryString ? `?${queryString}` : ""}`);
  }

  async getWorkflow(id: string): Promise<WorkflowResponse<Workflow>> {
    return this.request<WorkflowResponse<Workflow>>(`/api/v1/workflows/${id}`);
  }

  async createWorkflow(data: Partial<Workflow>): Promise<WorkflowResponse<Workflow>> {
    return this.request<WorkflowResponse<Workflow>>("/api/v1/workflows", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<WorkflowResponse<Workflow>> {
    return this.request<WorkflowResponse<Workflow>>(`/api/v1/workflows/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(id: string): Promise<WorkflowResponse<{ success: boolean }>> {
    return this.request<WorkflowResponse<{ success: boolean }>>(`/api/v1/workflows/${id}`, {
      method: "DELETE",
    });
  }

  async toggleWorkflow(id: string, active: boolean): Promise<WorkflowResponse<Workflow>> {
    return this.request<WorkflowResponse<Workflow>>(`/api/v1/workflows/${id}/toggle`, {
      method: "POST",
      body: JSON.stringify({ active }),
    });
  }

  async executeWorkflow(id: string): Promise<WorkflowResponse<WorkflowExecution>> {
    return this.request<WorkflowResponse<WorkflowExecution>>(`/api/v1/workflows/${id}/execute`, {
      method: "POST",
    });
  }

  async getExecutions(workflowId: string, limit: number = 50): Promise<WorkflowResponse<WorkflowExecution[]>> {
    return this.request<WorkflowResponse<WorkflowExecution[]>>(`/api/v1/workflows/${workflowId}/executions?limit=${limit}`);
  }

  async getExecution(workflowId: string, executionId: string): Promise<WorkflowResponse<WorkflowExecution>> {
    return this.request<WorkflowResponse<WorkflowExecution>>(`/api/v1/workflows/${workflowId}/executions/${executionId}`);
  }

  async getTemplates(): Promise<WorkflowResponse<WorkflowTemplate[]>> {
    return this.request<WorkflowResponse<WorkflowTemplate[]>>("/api/v1/workflows/templates");
  }

  async createFromTemplate(templateId: string, name: string): Promise<WorkflowResponse<Workflow>> {
    return this.request<WorkflowResponse<Workflow>>(`/api/v1/workflows/templates/${templateId}/create`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async duplicateWorkflow(id: string): Promise<WorkflowResponse<Workflow>> {
    return this.request<WorkflowResponse<Workflow>>(`/api/v1/workflows/${id}/duplicate`, {
      method: "POST",
    });
  }

  async exportWorkflow(id: string): Promise<WorkflowResponse<{ data: string }>> {
    return this.request<WorkflowResponse<{ data: string }>>(`/api/v1/workflows/${id}/export`);
  }

  async importWorkflow(data: string): Promise<WorkflowResponse<Workflow>> {
    return this.request<WorkflowResponse<Workflow>>("/api/v1/workflows/import", {
      method: "POST",
      body: JSON.stringify({ data }),
    });
  }

  async getStatistics(): Promise<WorkflowResponse<{
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
    recentExecutions: WorkflowExecution[];
  }>> {
    return this.request("/api/v1/workflows/statistics");
  }
}

export const workflowApi = new WorkflowApiService();