export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  role?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface AuthResponse {
  success: boolean;
  data?: TokenResponse;
  error?: string;
  message?: string;
}
