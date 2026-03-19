import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requiresAuthentication } from "./app/lib/navigation-config";

// Import specialized proxies
import { monitoringProxy } from "./infrastructure/monitoring/proxy";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Debug logs (uniquement en développement)
  if (process.env.NODE_ENV === "development") {
    console.log("Middleware - pathname:", pathname);
    console.log("Middleware - NODE_ENV:", process.env.NODE_ENV);
    console.log("Middleware - BACKEND_URL:", process.env.BACKEND_URL);
  }

  if (pathname.startsWith("/monitoring/")) {
    const monitoringRequest = monitoringProxy(request);
    if (monitoringRequest) {
      return fetch(monitoringRequest);
    }
  }

  // Ne pas intercepter les autres requêtes API ou /health
  if (pathname.startsWith("/api/") || pathname.startsWith("/health")) {
    return NextResponse.next();
  }

  const publicPaths = ["/login", "/register", "/forgot-password"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = pathname.startsWith("/admin");

  const token =
    request.cookies.get("authToken")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (
    !isPublicPath &&
    !isAdminPath &&
    requiresAuthentication(pathname) &&
    !token
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath && token && !isAdminPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();

  if (process.env.NODE_ENV === "production") {
    response.headers.set("X-Forwarded-Proto", "https");
    response.headers.set("X-Forwarded-Host", request.headers.get("host") || "");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)",
  ],
};
