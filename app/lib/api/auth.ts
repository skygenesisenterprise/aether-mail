import type { AuthResponse, TokenResponse, User } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class AuthApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getStoredToken();

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<AuthResponse> {
    const token = this.getStoredToken();
    return this.request<AuthResponse>("/api/v1/auth/logout", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async refreshToken(refreshToken?: string): Promise<AuthResponse> {
    const token = refreshToken || this.getStoredRefreshToken();
    return this.request<AuthResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: token }),
    });
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async resendVerificationEmail(email: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/send-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/confirm-password-reset", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getCurrentUser(): Promise<{ success: boolean; data?: User; error?: string }> {
    return this.request("/api/v1/auth/me");
  }

  async revokeToken(): Promise<AuthResponse> {
    const token = this.getStoredToken();
    return this.request<AuthResponse>("/api/v1/auth/revoke", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async getExternalProviders(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return this.request("/api/v1/auth/external/providers");
  }

  async initiateOAuth(provider: string): Promise<{ success: boolean; data?: { url: string }; error?: string }> {
    return this.request(`/api/v1/auth/external/${provider}`);
  }

  async handleOAuthCallback(provider: string, code: string): Promise<AuthResponse> {
    return this.request<AuthResponse>(`/api/v1/auth/external/${provider}/callback?code=${code}`);
  }

  async getTotpStatus(): Promise<{ success: boolean; data?: { enabled: boolean; hasBackupCodes: boolean }; error?: string }> {
    return this.request("/api/v1/auth/totp/status");
  }

  async setupTotp(): Promise<{ success: boolean; data?: { secret: string; qrCode: string }; error?: string }> {
    return this.request("/api/v1/auth/totp/setup", {
      method: "POST",
    });
  }

  async verifyTotp(code: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/totp/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  async disableTotp(): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/totp/disable", {
      method: "POST",
    });
  }

  async verifyTotpLogin(email: string, code: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/totp/login", {
      method: "POST",
      body: JSON.stringify({ email, totpCode: code }),
    });
  }

  async generateBackupCodes(): Promise<{ success: boolean; data?: { codes: string[] }; error?: string }> {
    return this.request("/api/v1/auth/mfa/backup-codes", {
      method: "POST",
    });
  }

  async startWebAuthnRegistration(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/auth/webauthn/register", {
      method: "POST",
    });
  }

  async verifyWebAuthn(credential: any): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/webauthn/verify", {
      method: "POST",
      body: JSON.stringify(credential),
    });
  }

  async getOIDCConfiguration(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/oauth2/.well-known/openid-configuration");
  }

  async getJWKS(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request("/api/v1/oauth2/jwks");
  }

  async getUserInfo(): Promise<{ success: boolean; data?: User; error?: string }> {
    return this.request("/api/v1/oauth2/userinfo");
  }

  private getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }

  storeTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;
    if (accessToken && accessToken !== "undefined" && accessToken !== "null" && accessToken.length > 0) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken || "");
    }
  }

  clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  getStoredUser(): TokenResponse["user"] | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("accessToken");
    if (!token || token === "undefined" || token === "null") return null;
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  storeUser(user: TokenResponse["user"]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
  }

  clearUser(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("user");
  }
}

export const authApi = new AuthApiService();