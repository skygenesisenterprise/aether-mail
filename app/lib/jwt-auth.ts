/**
 * JWT Authentication Utilities
 * Compatibility layer for existing auth context
 */

import { authService } from './services/backend-auth-service';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  status: string;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  lastLoginAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
  const result = await authService.login(credentials);
  
  if (!result.success || !result.user || !result.accessToken) {
    throw new Error(result.error || 'Login failed');
  }

  return {
    user: result.user,
    token: result.accessToken
  };
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  await authService.logout();
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  return await authService.getCurrentUser();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return authService.isAuthenticated();
};

/**
 * Get access token
 */
export const getToken = (): string | null => {
  return authService.getAccessToken();
};

/**
 * Initialize auth from storage
 */
export const initializeAuth = (): void => {
  authService.initializeFromStorage();
};