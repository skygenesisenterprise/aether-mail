// Service utilisateur simplifié pour le développement
// En production, utiliser Prisma avec une vraie base de données

export interface CreateUserData {
  email: string;
  fullName?: string;
  password: string;
  organizationId?: string;
  department?: string;
  position?: string;
  phone?: string;
}

export interface UpdateUserData {
  fullName?: string;
  department?: string;
  position?: string;
  phone?: string;
  status?: string;
  isActive?: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Stockage temporaire en mémoire (remplacer par Prisma en production)
const users: User[] = [];

export class UserService {
  static async create(data: CreateUserData): Promise<User> {
    const passwordHash = await UserService.hashPassword(data.password);

    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      username: data.email.split("@")[0],
      password: passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(user);
    return user;
  }

  static async findById(id: string): Promise<User | null> {
    return users.find((user) => user.id === id) || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    return users.find((user) => user.email === email) || null;
  }

  static async findAll(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      organizationId?: string;
    } = {},
  ): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 20, search } = options;
    const skip = (page - 1) * limit;

    let filteredUsers = users;

    if (search) {
      filteredUsers = users.filter(
        (user) =>
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.username.toLowerCase().includes(search.toLowerCase()),
      );
    }

    const paginatedUsers = filteredUsers.slice(skip, skip + limit);

    return {
      users: paginatedUsers,
      total: filteredUsers.length,
    };
  }

  static async update(id: string, data: UpdateUserData): Promise<User | null> {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    const user = users[userIndex];
    const updatedUser = {
      ...user,
      ...(data.fullName && { username: data.fullName }),
      updatedAt: new Date().toISOString(),
    };

    users[userIndex] = updatedUser;
    return updatedUser;
  }

  static async delete(id: string): Promise<void> {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
    }
  }

  static async updateLastLogin(id: string): Promise<void> {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      users[userIndex].updatedAt = new Date().toISOString();
    }
  }

  private static async hashPassword(password: string): Promise<string> {
    // En production, utiliser bcrypt ou argon2
    return Buffer.from(password).toString("base64");
  }

  static async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    const hashedPassword = await UserService.hashPassword(password);
    return hashedPassword === hash;
  }
}
