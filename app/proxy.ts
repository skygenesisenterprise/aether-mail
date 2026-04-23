import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

const countryToLocale: Record<string, Locale> = {
  BE: "be_fr",
  CH: "ch_fr",
  FR: "fr",
};

function getCountryFromRequest(request: NextRequest): string | null {
  const cloudflareCountry = request.headers.get("cf-ipcountry");
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  const fastlyCountry = request.headers.get("x-fastly-geo-country");
  return cloudflareCountry || vercelCountry || fastlyCountry || null;
}

function getLocaleFromCountry(country: string | null): Locale {
  if (country && country in countryToLocale) {
    return countryToLocale[country];
  }
  return routing.defaultLocale;
}

function isValidLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

const AUTH_PATHS = ["/login", "/register"];
const PROTECTED_PATHS = ["/exemple"];
const NO_LOCALE_PATHS = ["/discord", "/dashboard", "/docs", "/downloads", "/health", "/mfa", "/authorize"];

function isValidJWT(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  return parts.length === 3;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (pathname === "/" || pathname === "") {
    const country = getCountryFromRequest(request);
    const locale = getLocaleFromCountry(country);
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  const isAuthPath = AUTH_PATHS.some((p) => pathname === p || pathname === `/${firstSegment}${p}`);
  if (isAuthPath) {
    const cleanPath = AUTH_PATHS.find((p) => pathname.endsWith(p));
    if (pathname !== cleanPath) {
      return NextResponse.redirect(new URL(cleanPath!, request.url));
    }
    return NextResponse.next();
  }

  const isProtectedPath = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtectedPath) {
    const authCookie = request.cookies.get("auth_token");
    const isValid = isValidJWT(authCookie?.value);
    if (!isValid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (firstSegment && isValidLocale(firstSegment)) {
    const localePath = `/${firstSegment}`;
    const isNoLocalePath = NO_LOCALE_PATHS.some(
      (p) => pathname.startsWith(localePath + p) || pathname === localePath + p
    );
    if (isNoLocalePath) {
      const cleanPath = pathname.replace(localePath, "");
      return NextResponse.redirect(new URL(cleanPath || "/", request.url));
    }
    return NextResponse.next();
  }

  if (firstSegment && !isValidLocale(firstSegment)) {
    const isNoLocalePath = NO_LOCALE_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
    if (isNoLocalePath) {
      return NextResponse.next();
    }
    const country = getCountryFromRequest(request);
    const locale = getLocaleFromCountry(country);
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|health).*)"],
};
