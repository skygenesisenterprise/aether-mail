/**
 * JWT Authentication Service for Backend Integration
 * 
 * This service handles authentication with the Rust backend API
 * using JWT tokens and provides compatibility with NextAuth patterns.
 */

import { backendService, User } from '../services/backend-service'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  user?: User
  accessToken?: string
  refreshToken?: string
  error?: string
}

export interface AuthUser {
  id: string
  email: string
  name?: string
  image?: string
  role?: string
  permissions?: string[]
}

class BackendAuthService {
  private static instance: BackendAuthService
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private user: User | null = null

  private constructor() {}

  static getInstance(): BackendAuthService {
    if (!BackendAuthService.instance) {
      BackendAuthService.instance = new BackendAuthService()
    }
    return BackendAuthService.instance
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await backendService.login(credentials.email, credentials.password)

      if (response.data) {
        const { access_token, refresh_token, user } = response.data

        // Store tokens
        this.accessToken = access_token
        this.refreshToken = refresh_token
        this.user = user

        // Configure backend service with token
        backendService.setAuthToken(access_token)

        // Store in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          localStorage.setItem('user', JSON.stringify(user))
        }

        return {
          success: true,
          user,
          accessToken: access_token,
          refreshToken: refresh_token,
        }
      } else {
        return {
          success: false,
          error: response.error || 'Login failed',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout
      await backendService.logout()
    } catch (error) {
      console.warn('Backend logout failed:', error)
    } finally {
      // Clear local storage
      this.clearTokens()
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false
    }

    try {
      const response = await backendService.refreshToken(this.refreshToken)

      if (response.data) {
        const { access_token, refresh_token } = response.data

        this.accessToken = access_token
        if (refresh_token) {
          this.refreshToken = refresh_token
        }

        // Update backend service
        backendService.setAuthToken(access_token)

        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access_token)
          if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token)
          }
        }

        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    // If refresh fails, clear tokens
    this.clearTokens()
    return false
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    if (this.user) {
      return this.user
    }

    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('access_token')

      if (storedUser && storedToken) {
        try {
          const user = JSON.parse(storedUser)
          // Add compatibility properties
          user.role = this.getUserRole(user)
          user.name = user.fullName
          this.user = user
          this.accessToken = storedToken
          backendService.setAuthToken(storedToken)
          return user
        } catch (error) {
          console.error('Failed to parse stored user:', error)
        }
      }
    }

    // Try to get user from backend
    if (this.accessToken) {
      try {
        const response = await backendService.getCurrentUser()
        if (response.data) {
          const user = response.data
          // Add compatibility properties
          user.role = this.getUserRole(user)
          user.name = user.fullName
          this.user = user
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user))
          }
          return user
        }
      } catch (error) {
        console.error('Failed to get current user:', error)
      }
    }

    return null
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.accessToken
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.user
  }

  /**
   * Initialize auth from localStorage
   */
  initializeFromStorage(): void {
    if (typeof window === 'undefined') {
      return
    }

    const storedToken = localStorage.getItem('access_token')
    const storedRefreshToken = localStorage.getItem('refresh_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken) {
      this.accessToken = storedToken
      backendService.setAuthToken(storedToken)
    }

    if (storedRefreshToken) {
      this.refreshToken = storedRefreshToken
    }

    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
      }
    }
  }

  /**
   * Clear all tokens and user data
   */
  private clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
    this.user = null

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  }

  /**
   * Convert User to NextAuth compatible format
   */
  toNextAuthUser(user: User): AuthUser {
    const role = this.getUserRole(user);
    // Add role and name to user object for compatibility
    user.role = role;
    user.name = user.fullName;
    
    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      image: user.avatar,
      role: role,
      permissions: this.getUserPermissions(user),
    }
  }

  /**
   * Extract user role from user data
   */
  private getUserRole(user: User): string {
    // This would typically come from user roles in the database
    // For now, we'll use a simple heuristic based on email
    if (user.email.includes('admin')) {
      return 'admin'
    } else if (user.email.includes('manager')) {
      return 'manager'
    }
    return 'user'
  }

  /**
   * Extract user permissions from user data
   */
  private getUserPermissions(user: User): string[] {
    const role = this.getUserRole(user)
    
    switch (role) {
      case 'admin':
        return ['users:read', 'users:write', 'projects:read', 'projects:write', 'admin:access']
      case 'manager':
        return ['users:read', 'projects:read', 'projects:write']
      default:
        return ['projects:read']
    }
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    if (!this.user) {
      return false
    }

    const permissions = this.getUserPermissions(this.user)
    return permissions.includes(permission)
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    if (!this.user) {
      return false
    }

    const userPermissions = this.getUserPermissions(this.user)
    return permissions.some(permission => userPermissions.includes(permission))
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    if (!this.user) {
      return false
    }

    const userPermissions = this.getUserPermissions(this.user)
    return permissions.every(permission => userPermissions.includes(permission))
  }
}

// Export singleton instance
export const authService = BackendAuthService.getInstance()

// Export types
export type { BackendAuthService }
export type { User } from '../services/backend-service'