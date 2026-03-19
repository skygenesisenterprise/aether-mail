import {
  User,
  Session,
  AuthResult,
  STORAGE_KEYS,
  UserPreferences,
  createDefaultProfile,
} from "./types";
import { hashPassword, verifyPassword, generateId, generateToken } from "./crypto";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function getUsers(): User[] {
  const storage = getStorage();
  if (!storage) return [];
  const data = storage.getItem(STORAGE_KEYS.USERS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getSession(): Session | null {
  const storage = getStorage();
  if (!storage) return null;
  const data = storage.getItem(STORAGE_KEYS.SESSION);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function saveSession(session: Session | null): void {
  const storage = getStorage();
  if (!storage) return;
  if (session) {
    storage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } else {
    storage.removeItem(STORAGE_KEYS.SESSION);
  }
}

const MOCK_USERS: User[] = [
  {
    id: "user-liamvonastoria",
    email: "liam@liamvonastoria.net",
    username: "liamvonastoria",
    passwordHash: "mock",
    createdAt: new Date("2023-01-15").getTime(),
    role: "user",
    profile: {
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=LA&backgroundColor=0ea5e9",
      bio: "🎯 Focusing\n\nFull Stack Developer | Tech Enthusiast | Builder of digital futures 🌍💻",
      location: "Earth",
      website: "https://liamvonastoria.net",
      twitter: "liamvnastoria",
      company: "Sky Genesis Enterprise",
      followers: 9,
      following: 41,
      publicRepos: 28,
      publicGists: 0,
      hireable: true,
      createdAt: new Date("2023-01-15").getTime(),
      updatedAt: Date.now(),
    },
  },
  {
    id: "user-alexdev",
    email: "alex@example.com",
    username: "alexdev",
    passwordHash: "mock",
    createdAt: new Date("2023-06-20").getTime(),
    role: "user",
    profile: {
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=AD&backgroundColor=10b981",
      bio: "Full Stack Developer passionate about React and Node.js",
      location: "San Francisco, CA",
      website: "https://alexdev.dev",
      twitter: "",
      company: "Tech Corp",
      followers: 42,
      following: 128,
      publicRepos: 15,
      publicGists: 3,
      hireable: true,
      createdAt: new Date("2023-06-20").getTime(),
      updatedAt: Date.now(),
    },
  },
];

function seedMockUsers(): void {
  const storage = getStorage();
  if (!storage) return;

  const existingData = storage.getItem(STORAGE_KEYS.USERS);
  if (existingData) return;

  storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
}

export class LocalAuthEngine {
  constructor() {
    if (typeof window !== "undefined") {
      seedMockUsers();
    }
  }

  async register(email: string, username: string, password: string): Promise<AuthResult> {
    const users = getUsers();

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "Email already registered" };
    }

    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: "Username already taken" };
    }

    const passwordHash = await hashPassword(password);

    const user: User = {
      id: generateId(),
      email: email.toLowerCase(),
      username,
      passwordHash,
      createdAt: Date.now(),
      role: "user",
      profile: createDefaultProfile(username),
    };

    users.push(user);
    saveUsers(users);

    const session = this.createSession(user.id);
    saveSession(session);

    return { success: true, user, session };
  }

  async login(emailOrUsername: string, password: string): Promise<AuthResult> {
    const users = getUsers();

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
        u.username.toLowerCase() === emailOrUsername.toLowerCase()
    );

    if (!user) {
      return { success: false, error: "Invalid credentials" };
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return { success: false, error: "Invalid credentials" };
    }

    const session = this.createSession(user.id);
    saveSession(session);

    return { success: true, user, session };
  }

  async logout(): Promise<void> {
    saveSession(null);
  }

  async getSession(): Promise<{ user: User; session: Session } | null> {
    const session = getSession();

    if (!session) {
      return null;
    }

    if (session.expiresAt < Date.now()) {
      saveSession(null);
      return null;
    }

    const users = getUsers();
    const user = users.find((u) => u.id === session.userId);

    if (!user) {
      saveSession(null);
      return null;
    }

    return { user, session };
  }

  async refreshSession(): Promise<Session | null> {
    const current = await this.getSession();
    if (!current) return null;

    const newSession = this.createSession(current.user.id);
    return newSession;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = getUsers();
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    return user || null;
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    return session?.user || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const users = getUsers();
    const index = users.findIndex((u) => u.id === userId);

    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    saveUsers(users);

    return users[index];
  }

  async updateProfile(
    username: string,
    profileUpdates: Partial<User["profile"]>
  ): Promise<User | null> {
    const users = getUsers();
    const index = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());

    if (index === -1) return null;

    users[index].profile = { ...users[index].profile, ...profileUpdates, updatedAt: Date.now() };
    saveUsers(users);

    return users[index];
  }

  async getPreferences(): Promise<UserPreferences> {
    const storage = getStorage();
    if (!storage) return { theme: "system", language: "en", notifications: true };

    const data = storage.getItem(STORAGE_KEYS.PREFS);
    if (!data) return { theme: "system", language: "en", notifications: true };

    try {
      return JSON.parse(data);
    } catch {
      return { theme: "system", language: "en", notifications: true };
    }
  }

  async savePreferences(prefs: UserPreferences): Promise<void> {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(prefs));
  }

  private createSession(userId: string): Session {
    const now = Date.now();
    return {
      userId,
      token: generateToken(),
      expiresAt: now + SESSION_DURATION,
      createdAt: now,
    };
  }
}

export const authEngine = new LocalAuthEngine();
