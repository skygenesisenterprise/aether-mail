/**
 * Authentication Mode Service
 * 
 * Simple service to determine authentication mode based on environment variable
 */

export type AuthMode = 'local' | 'sso'

class AuthModeService {
  private static instance: AuthModeService
  private currentMode: AuthMode

  private constructor() {
    // Read from environment variable or default to local
    this.currentMode = (process.env.NEXT_PUBLIC_AUTH_MODE as AuthMode) || 'local'
  }

  static getInstance(): AuthModeService {
    if (!AuthModeService.instance) {
      AuthModeService.instance = new AuthModeService()
    }
    return AuthModeService.instance
  }

  /**
   * Get current authentication mode
   */
  getCurrentMode(): AuthMode {
    return this.currentMode
  }

  /**
   * Check if current mode is local
   */
  isLocalMode(): boolean {
    return this.currentMode === 'local'
  }

  /**
   * Check if current mode is SSO
   */
  isSSOMode(): boolean {
    return this.currentMode === 'sso'
  }

  /**
   * Get API base URL based on current mode
   */
  getApiBaseUrl(): string {
    if (this.isLocalMode()) {
      return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1'
    } else {
      return 'https://sso.skygenesisenterprise.com/api/v1'
    }
  }

  /**
   * Get Keycloak URL based on current mode
   */
  getKeycloakUrl(): string {
    if (this.isLocalMode()) {
      return process.env.KEYCLOAK_URL || 'http://localhost:8080'
    } else {
      return 'https://sso.skygenesisenterprise.com'
    }
  }

  /**
   * Get Keycloak realm based on current mode
   */
  getKeycloakRealm(): string {
    return process.env.KEYCLOAK_REALM || 'skygenesisenterprise'
  }

  /**
   * Get Keycloak client ID based on current mode
   */
  getKeycloakClientId(): string {
    return process.env.KEYCLOAK_CLIENT_ID || 'api-client'
  }
}

// Export singleton instance
export const authModeService = AuthModeService.getInstance()

// Export types
export type { AuthModeService }