import { prisma } from '../prisma'

export interface CreateUserData {
  email: string
  fullName?: string
  password: string
  organizationId?: string
  department?: string
  position?: string
  phone?: string
}

export interface UpdateUserData {
  fullName?: string
  department?: string
  position?: string
  phone?: string
  status?: string
  isActive?: boolean
}

export class UserService {
  static async create(data: CreateUserData) {
    const passwordHash = await this.hashPassword(data.password)
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash,
        organizationId: data.organizationId,
      },
      include: {
        organization: true,
      }
    })

    return user
  }

  static async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
      }
    })
  }

  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      }
    })
  }

  static async findAll(options: {
    page?: number
    limit?: number
    search?: string
    status?: string
    organizationId?: string
  } = {}) {
    const { page = 1, limit = 20, search, status, organizationId } = options
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (organizationId) {
      where.organizationId = organizationId
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          organization: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    return { users, total }
  }

  static async update(id: string, data: UpdateUserData) {
    const user = await prisma.user.update({
      where: { id },
      data,
      include: {
        organization: true,
      }
    })

    return user
  }

  static async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id }
    })
  }

  static async updateLastLogin(id: string): Promise<void> {
    // Pour l'instant, nous allons juste mettre à jour updatedAt
    await prisma.user.update({
      where: { id },
      data: { updatedAt: new Date() }
    })
  }

  private static async hashPassword(password: string): Promise<string> {
    // En production, utiliser bcrypt ou argon2
    return Buffer.from(password).toString('base64')
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password)
    return hashedPassword === hash
  }
}