export interface UserProfile {
  avatarUrl: string;
  bio: string;
  location: string;
  website: string;
  twitter: string;
  company: string;
  followers: number;
  following: number;
  publicRepos: number;
  publicGists: number;
  hireable: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: number;
  role: string;
  profile: UserProfile;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: number;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: boolean;
}

export const STORAGE_KEYS = {
  USERS: "giteria:auth:users",
  SESSION: "giteria:auth:session",
  PREFS: "giteria:auth:prefs",
} as const;

export function createDefaultProfile(username: string): UserProfile {
  return {
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=0ea5e9`,
    bio: "",
    location: "",
    website: "",
    twitter: "",
    company: "",
    followers: 0,
    following: 0,
    publicRepos: 0,
    publicGists: 0,
    hireable: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
