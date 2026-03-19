import { User, Session, AuthResult, createDefaultProfile } from "./types";
import { hashPassword, verifyPassword, generateId, generateToken } from "./crypto";
import { db, STORES } from "../db";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export class IndexedDBAuthEngine {
  constructor() {}

  createSession(userId: string): Session {
    return {
      token: generateToken(),
      userId,
      expiresAt: Date.now() + SESSION_DURATION,
      createdAt: Date.now(),
    };
  }

  async register(email: string, username: string, password: string): Promise<AuthResult> {
    const users = await db.getAll<User>(STORES.USERS);

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

    await db.add(STORES.USERS, user);

    const session = this.createSession(user.id);
    await db.put(STORES.SESSIONS, { id: "current", ...session });

    return { success: true, user, session };
  }

  async login(emailOrUsername: string, password: string): Promise<AuthResult> {
    const users = await db.getAll<User>(STORES.USERS);

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
    await db.put(STORES.SESSIONS, { id: "current", ...session });

    return { success: true, user, session };
  }

  async logout(): Promise<void> {
    await db.delete(STORES.SESSIONS, "current");
  }

  async getSession(): Promise<{ user: User; session: Session } | null> {
    const session = await db.get<Session>(STORES.SESSIONS, "current");

    if (!session) {
      return null;
    }

    if (session.expiresAt < Date.now()) {
      await db.delete(STORES.SESSIONS, "current");
      return null;
    }

    const user = await db.get<User>(STORES.USERS, session.userId);

    if (!user) {
      await db.delete(STORES.SESSIONS, "current");
      return null;
    }

    return { user, session };
  }

  async refreshSession(): Promise<Session | null> {
    const current = await this.getSession();
    if (!current) return null;

    const newSession = this.createSession(current.user.id);
    await db.put(STORES.SESSIONS, { id: "current", ...newSession });
    return newSession;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = await db.getAll<User>(STORES.USERS);
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    return user || null;
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    return session?.user || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const user = await db.get<User>(STORES.USERS, userId);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    await db.put(STORES.USERS, updatedUser);
    return updatedUser;
  }

  async updateProfile(
    username: string,
    profileUpdates: Partial<User["profile"]>
  ): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const updatedProfile = {
      ...user.profile,
      ...profileUpdates,
      updatedAt: Date.now(),
    };

    const updatedUser = { ...user, profile: updatedProfile };
    await db.put(STORES.USERS, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return db.getAll<User>(STORES.USERS);
  }
}

export const authEngine = new IndexedDBAuthEngine();
