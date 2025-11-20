/**
 * Backend Integration Service
 * 
 * This service handles communication between the Next.js frontend
 * and the Rust backend API.
 */

export interface BackendResponse<T = any> {
  data?: T;
  error?: string;
  status?: number;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  name?: string; // Alias for fullName for compatibility
  status: string;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  role?: string; // Computed role for compatibility
  lastLoginAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  key: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  progress: number;
  organizationId: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  project: string;
  user: string;
  role: string;
  joinedAt: string;
  isActive: boolean;
}

class BackendService {
  private baseUrl: string;
  private apiKey: string | null = null;

  constructor() {
    this.baseUrl = process.env.RUST_API_BASE_URL || 'http://localhost:8080/api/v1';
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string) {
    this.apiKey = token;
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Make HTTP request to backend
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BackendResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || 'Request failed',
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ======================================
  // AUTHENTICATION ENDPOINTS
  // ======================================

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<BackendResponse<{ access_token: string; refresh_token: string; user: User }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<BackendResponse<User>> {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  /**
   * Logout current user
   */
  async logout(): Promise<BackendResponse<{ message: string }>> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<BackendResponse<{ access_token: string; refresh_token: string }>> {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // ======================================
  // USER MANAGEMENT ENDPOINTS
  // ======================================

  /**
   * Get all users
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<BackendResponse<{ users: User[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return this.request(`/users${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<BackendResponse<User>> {
    return this.request(`/users/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Create new user
   */
  async createUser(userData: Partial<User> & { password: string }): Promise<BackendResponse<User>> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: Partial<User>): Promise<BackendResponse<User>> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<BackendResponse<{ message: string }>> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ======================================
  // PROJECT MANAGEMENT ENDPOINTS
  // ======================================

  /**
   * Get all projects
   */
  async getProjects(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    organizationId?: string;
  } = {}): Promise<BackendResponse<{ projects: Project[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.organizationId) searchParams.set('organization_id', params.organizationId);

    const query = searchParams.toString();
    return this.request(`/projects${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<BackendResponse<Project & { members?: ProjectMember[] }>> {
    return this.request(`/projects/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Create new project
   */
  async createProject(projectData: Partial<Project>): Promise<BackendResponse<Project>> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  /**
   * Update project
   */
  async updateProject(id: string, projectData: Partial<Project>): Promise<BackendResponse<Project>> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<BackendResponse<{ message: string }>> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Add member to project
   */
  async addProjectMember(projectId: string, userId: string, role: string = 'member'): Promise<BackendResponse<ProjectMember>> {
    return this.request(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role }),
    });
  }

  /**
   * Remove member from project
   */
  async removeProjectMember(projectId: string, userId: string): Promise<BackendResponse<{ message: string }>> {
    return this.request(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Update project member role
   */
  async updateProjectMemberRole(projectId: string, userId: string, role: string): Promise<BackendResponse<ProjectMember>> {
    return this.request(`/projects/${projectId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  // ======================================
  // DATABASE ENDPOINTS (via Rust backend)
  // ======================================

  /**
   * Execute database query through backend
   */
  async executeQuery(connectionId: string, query: string, parameters: any[] = [], readOnly: boolean = true): Promise<BackendResponse<any>> {
    return this.request('/data/query', {
      method: 'POST',
      body: JSON.stringify({
        connection_id: connectionId,
        query,
        parameters,
        read_only: readOnly,
      }),
    });
  }

  /**
   * Get database connections
   */
  async getDatabaseConnections(): Promise<BackendResponse<any[]>> {
    return this.request('/data/connections', {
      method: 'GET',
    });
  }

  /**
   * Create database connection
   */
  async createDatabaseConnection(connectionData: any): Promise<BackendResponse<any>> {
    return this.request('/data/connections', {
      method: 'POST',
      body: JSON.stringify(connectionData),
    });
  }

  // ======================================
  // HEALTH CHECK
  // ======================================

  /**
   * Check backend health
   */
  async healthCheck(): Promise<BackendResponse<{ status: string; timestamp: string }>> {
    return this.request('/health', {
      method: 'GET',
    });
  }

  /**
   * Test connection to backend
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.request('/hello');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const backendService = new BackendService();

// Export types
export type { BackendService };