import { prisma } from '../prisma'

export interface CreateProjectData {
  name: string
  description?: string
  key: string
  status?: string
  priority?: string
  startDate?: Date
  endDate?: Date
  budget?: number
  organizationId: string
  createdBy: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
  status?: string
  priority?: string
  startDate?: Date
  endDate?: Date
  budget?: number
  progress?: number
}

export class ProjectService {
  static async create(data: CreateProjectData) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        key: data.key,
        status: data.status || 'active',
        priority: data.priority || 'medium',
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget ? data.budget : undefined,
        organizationId: data.organizationId,
        createdBy: data.createdBy,
      },
      include: {
        organizationRelation: true,
        creatorRelation: true,
        members: {
          include: {
            userRelation: true
          }
        }
      }
    })

    return project
  }

  static async findById(id: string) {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        organizationRelation: true,
        creatorRelation: true,
        members: {
          include: {
            userRelation: true
          }
        }
      }
    })
  }

  static async findByKey(key: string) {
    return await prisma.project.findUnique({
      where: { key },
      include: {
        organizationRelation: true,
        creatorRelation: true,
        members: {
          include: {
            userRelation: true
          }
        }
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
        { name: { contains: search, mode: 'insensitive' } },
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (organizationId) {
      where.organizationId = organizationId
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          organizationRelation: true,
          creatorRelation: true,
          members: {
            include: {
              userRelation: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.project.count({ where })
    ])

    return { projects, total }
  }

  static async update(id: string, data: UpdateProjectData) {
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        budget: data.budget ? data.budget.toString() : undefined,
      },
      include: {
        organizationRelation: true,
        creatorRelation: true,
        members: {
          include: {
            userRelation: true
          }
        }
      }
    })

    return project
  }

  static async delete(id: string): Promise<void> {
    await prisma.project.delete({
      where: { id }
    })
  }

  static async addMember(projectId: string, userId: string, role: string = 'member') {
    return await prisma.projectMember.create({
      data: {
        project: projectId,
        user: userId,
        role,
      },
      include: {
        projectRelation: {
          include: {
            organizationRelation: true
          }
        },
        userRelation: true
      }
    })
  }

  static async removeMember(projectId: string, userId: string) {
    await prisma.projectMember.deleteMany({
      where: {
        project: projectId,
        user: userId
      }
    })
  }

  static async getProjectsByUser(userId: string) {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { createdBy: userId },
          {
            members: {
              some: {
                user: userId,
                isActive: true
              }
            }
          }
        ]
      },
      include: {
        organizationRelation: true,
        creatorRelation: true,
        members: {
          include: {
            userRelation: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return projects
  }
}