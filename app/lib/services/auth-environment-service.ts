/**
 * Authentication Environment Configuration Service
 * 
 * This service manages different authentication environments:
 * - Local: Uses the local backend API
 * - SSO: Uses the central SSO server (sso.skygenesisenterprise.com)
 */

export type AuthEnvironment = 'local' | 'sso'

export interface AuthEnvironmentConfig {
  id: AuthEnvironment
  name: string
  description: string
  apiBaseUrl: string
  keycloakUrl?: string
  keycloakRealm?: string
  keycloakClientId?: string
  icon: string
}

class AuthEnvironmentService {
  private static instance: AuthEnvironmentService
  private currentEnvironment: AuthEnvironment = 'local'
  
  private environments: Record<AuthEnvironment, AuthEnvironmentConfig> = {
    local: {
      id: 'local',
      name: 'Local Environment',
      description: 'Use local backend API for authentication',
      apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1',
      keycloakUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
      keycloakRealm: process.env.KEYCLOAK_REALM || 'skygenesisenterprise',
      keycloakClientId: process.env.KEYCLOAK_CLIENT_ID || 'api-client',
      icon: '🏠'
    },
    sso: {
      id: 'sso',
      name: 'SSO Enterprise',
      description: 'Use central SSO server for authentication',
      apiBaseUrl: 'https://sso.skygenesisenterprise.com/api/v1',
      keycloakUrl: 'https://sso.skygenesisenterprise.com',
      keycloakRealm: 'skygenesisenterprise',
      keycloakClientId: 'api-client',
      icon: '🌐'
    }
  }

  private constructor() {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_environment') as AuthEnvironment
      if (stored && this.environments[stored]) {
        this.currentEnvironment = stored
      }
    }
  }

  static getInstance(): AuthEnvironmentService {
    if (!AuthEnvironmentService.instance) {
      AuthEnvironmentService.instance = new AuthEnvironmentService()
    }
    return AuthEnvironmentService.instance
  }

  /**
   * Get all available environments
   */
  getEnvironments(): AuthEnvironmentConfig[] {
    return Object.values(this.environments)
  }

  /**
   * Get current environment configuration
   */
  getCurrentEnvironment(): AuthEnvironmentConfig {
    return this.environments[this.currentEnvironment]
  }

  /**
   * Get environment by ID
   */
  getEnvironment(id: AuthEnvironment): AuthEnvironmentConfig | null {
    return this.environments[id] || null
  }

  /**
   * Set current environment
   */
  setEnvironment(id: AuthEnvironment): void {
    if (this.environments[id]) {
      this.currentEnvironment = id
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_environment', id)
      }
    }
  }

  /**
   * Get current environment ID
   */
  getCurrentEnvironmentId(): AuthEnvironment {
    return this.currentEnvironment
  }

  /**
   * Get API base URL for current environment
   */
  getApiBaseUrl(): string {
    return this.getCurrentEnvironment().apiBaseUrl
  }

  /**
   * Get Keycloak configuration for current environment
   */
  getKeycloakConfig(): {
    url: string
    realm: string
    clientId: string
  } | null {
    const env = this.getCurrentEnvironment()
    if (!env.keycloakUrl || !env.keycloakRealm || !env.keycloakClientId) {
      return null
    }
    
    return {
      url: env.keycloakUrl,
      realm: env.keycloakRealm,
      clientId: env.keycloakClientId
    }
  }

  /**
   * Check if current environment is SSO
   */
  isSSOEnvironment(): boolean {
    return this.currentEnvironment === 'sso'
  }

  /**
   * Check if current environment is local
   */
  isLocalEnvironment(): boolean {
    return this.currentEnvironment === 'local'
  }

  /**
   * Reset to default environment
   */
  resetToDefault(): void {
    this.setEnvironment('local')
  }
}

// Export singleton instance
export const authEnvironmentService = AuthEnvironmentService.getInstance()

// Export types
export type { AuthEnvironmentService }