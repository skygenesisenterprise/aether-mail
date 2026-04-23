"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { authApi, type TokenResponse } from "@/lib/api/auth";
import type { User } from "@/lib/api/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: "github" | "google") => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    if (hasCheckedAuth.current) {
      return;
    }
    hasCheckedAuth.current = true;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const storedUser = authApi.getStoredUser();

      console.log(
        "[AuthContext] checkAuth - storedUser:",
        !!storedUser,
        "token:",
        token ? `exists (${token?.length})` : "null"
      );

      if (token && token.length > 0 && token !== "undefined" && token !== "null") {
        if (storedUser) {
          console.log("[AuthContext] Setting user from stored data");
          setUser(storedUser);
        } else {
          console.log("[AuthContext] Token exists but no stored user, fetching account");
          try {
            const accountResponse = await authApi.getAccount();
            if (accountResponse.success && accountResponse.data?.user) {
              authApi.storeUser(accountResponse.data.user);
              setUser(accountResponse.data.user);
            } else {
              console.log("[AuthContext] Could not fetch account, clearing invalid session");
              authApi.clearTokens();
              authApi.clearUser();
              setUser(null);
            }
          } catch (e) {
            console.error("[AuthContext] Error fetching account:", e);
            authApi.clearTokens();
            authApi.clearUser();
            setUser(null);
          }
        }
      } else {
        console.log("[AuthContext] No valid token found");
        authApi.clearTokens();
        authApi.clearUser();
        setUser(null);
      }
    } catch (e) {
      console.error("[AuthContext] checkAuth error:", e);
      authApi.clearTokens();
      authApi.clearUser();
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);

      console.log("[AuthContext] Login response:", response);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Login failed");
      }

      const { accessToken, refreshToken, user: userData } = response.data;

      authApi.storeTokens(accessToken || "", refreshToken || "");
      authApi.storeUser(userData);
      setUser(userData);

      console.log("[AuthContext] Login successful, user set, redirecting...");

      const isAdmin = email.toLowerCase().endsWith("@etheriatimes.com");
      const redirectTo = isAdmin ? "/dashboard" : "/user";
      console.log("[AuthContext] Redirecting to:", redirectTo);
      router.push(redirectTo);
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: "github" | "google") => {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const scope = "openid profile email";

    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem("oauth_state", state);

    const authUrl = new URL(`${process.env.NEXT_PUBLIC_IDENTITY_API_URL}/oauth/authorize`);
    authUrl.searchParams.set("client_id", clientId || "");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("provider", provider);

    window.location.href = authUrl.toString();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      authApi.clearTokens();
      authApi.clearUser();
      setUser(null);
      hasCheckedAuth.current = false;
      router.push("/login");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithOAuth,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}
