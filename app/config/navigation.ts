/**
 * Configuration des redirections après authentification
 */

export const NAVIGATION_CONFIG = {
  /**
   * Page par défaut après authentification standard
   */
  DEFAULT_REDIRECT: "/dashboard",
  
  /**
   * Page de login
   */
  LOGIN_PAGE: "/login",
  
  /**
   * Page de registration
   */
  REGISTER_PAGE: "/register",
  
  /**
   * Page de forgot password
   */
  FORGOT_PASSWORD_PAGE: "/forgot",
  
  /**
   * Redirections conditionnelles basées sur le rôle
   */
  ROLE_BASED_REDIRECTS: {
    admin: "/admin",
    user: "/dashboard",
  },
  
  /**
   * Redirections OAuth - ces URLs doivent correspondre aux endpoints du serveur
   */
  OAUTH_REDIRECTS: {
    authorize: "/oauth/authorize",
    token: "/oauth/token",
    userinfo: "/oauth/userinfo",
  },
};

export function getRedirectUrl(
  isOAuth: boolean,
  oauthParams: {
    client_id?: string;
    redirect_uri?: string;
    response_type?: string;
    scope?: string;
    state?: string;
  },
  userRole?: string
): string {
  // Si c'est une authentification OAuth, rediriger vers le endpoint d'autorisation
  if (isOAuth && oauthParams.client_id && oauthParams.redirect_uri) {
    const params = new URLSearchParams();
    params.set("client_id", oauthParams.client_id);
    params.set("redirect_uri", oauthParams.redirect_uri);
    params.set("response_type", oauthParams.response_type || "code");
    params.set("scope", oauthParams.scope || "openid profile email");
    params.set("state", oauthParams.state || "");
    
    return `${NAVIGATION_CONFIG.OAUTH_REDIRECTS.authorize}?${params.toString()}`;
  }
  
  // Si l'utilisateur a un rôle spécifique, utiliser la redirection basée sur le rôle
  if (userRole && NAVIGATION_CONFIG.ROLE_BASED_REDIRECTS[userRole as keyof typeof NAVIGATION_CONFIG.ROLE_BASED_REDIRECTS]) {
    return NAVIGATION_CONFIG.ROLE_BASED_REDIRECTS[userRole as keyof typeof NAVIGATION_CONFIG.ROLE_BASED_REDIRECTS];
  }
  
  // Sinon, utiliser la redirection par défaut
  return NAVIGATION_CONFIG.DEFAULT_REDIRECT;
}
