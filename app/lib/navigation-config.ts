/**
 * Navigation Configuration
 * 
 * Controls navigation behavior based on environment mode
 */

export type NavigationMode = 'development' | 'production';

export const NAVIGATION_MODE = (
  process.env.NEXT_PUBLIC_NAVIGATION_MODE || 'development'
) as NavigationMode;

/**
 * Check if free navigation is enabled
 */
export const isFreeNavigationEnabled = (): boolean => {
  return NAVIGATION_MODE === 'development';
};

/**
 * Routes that require authentication in production mode
 */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/projects',
  '/users',
  '/settings',
  '/profile',
  '/inbox',
  '/logs',
];

/**
 * Routes that are always accessible (public routes)
 */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/docs/swagger',
];

/**
 * Check if a route requires authentication
 */
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
};

/**
 * Check if a route is public
 */
export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
};

/**
 * Determine if authentication should be required for a route
 */
export const requiresAuthentication = (path: string): boolean => {
  // In development mode, no authentication required
  if (isFreeNavigationEnabled()) {
    return false;
  }
  
  // In production mode, check if route is protected
  return isProtectedRoute(path);
};