import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Désactiver l'authentification en développement
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // Si l'utilisateur est sur une route publique, le laisser passer sans vérification
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Pour toutes les autres routes, vérifier s'il y a une authentification
  const authCookie = request.cookies.get("auth-token");
  const isAuthenticated = request.cookies.get("isAuthenticated")?.value;

  // Si pas d'authentification trouvée, rediriger vers login avec l'URL originale comme paramètre
  if (!authCookie && isAuthenticated !== "true") {
    // Rediriger vers login avec l'URL originale comme paramètre
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
