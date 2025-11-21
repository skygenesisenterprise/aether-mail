import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

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

export class UserService {
  static async create(data: CreateUserData) {
    const passwordHash = await UserService.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        username: data.email.split("@")[0],
        email: data.email,
        password: passwordHash,
      },
    });

    return user;
  }

  static async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  static async findAll(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      organizationId?: string;
    } = {},
  ) {
    const { page = 1, limit = 20, search } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { username: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  static async update(id: string, data: UpdateUserData) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName && { username: data.fullName }),
      },
    });

    return user;
  }

  static async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  static async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
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
