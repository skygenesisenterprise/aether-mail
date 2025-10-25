import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionData {
  user: User;
  session: {
    id: string;
    expiresAt: string;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

interface AuthState {
  user: User | null;
  session: SessionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    serverConfig?: any,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setSession: (session: SessionData | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string, serverConfig?: any) => {
        try {
          set({ isLoading: true });
          const response = await fetch("/api/auth/sign-in/email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, serverConfig }),
            credentials: "include",
          });

          const data = await response.json();

          if (response.ok && data.user) {
            const session: SessionData = {
              user: data.user,
              session: data.session,
            };
            set({
              user: data.user,
              session,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: data.message || "Login failed" };
          }
        } catch (error) {
          console.error("Login error:", error);
          set({ isLoading: false });
          return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
          };
        }
      },

      logout: async () => {
        try {
          await fetch("/api/auth/sign-out", {
            method: "POST",
            credentials: "include",
          });
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      checkSession: async () => {
        try {
          set({ isLoading: true });
          const response = await fetch("/api/auth/session", {
            credentials: "include",
          });

          if (response.ok) {
            const session = await response.json();
            if (session.user) {
              set({
                user: session.user,
                session,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              set({
                user: null,
                session: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setSession: (session) => {
        if (session) {
          set({
            user: session.user,
            session,
            isAuthenticated: true,
          });
        } else {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
