// Services de projet temporairement désactivés
// Ces services nécessitent un schéma Prisma complet avec les modèles Project

export interface CreateProjectData {
  name: string;
  description?: string;
  key: string;
  status?: string;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  organizationId: string;
  createdBy: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  progress?: number;
}

export class ProjectService {
  static async create(data: CreateProjectData) {
    console.log("ProjectService.create not implemented yet");
    return null;
  }

  static async findById(id: string) {
    console.log("ProjectService.findById not implemented yet");
    return null;
  }

  static async findByKey(key: string) {
    console.log("ProjectService.findByKey not implemented yet");
    return null;
  }

  static async findAll(options: any = {}) {
    console.log("ProjectService.findAll not implemented yet");
    return { projects: [], total: 0 };
  }

  static async update(id: string, data: UpdateProjectData) {
    console.log("ProjectService.update not implemented yet");
    return null;
  }

  static async delete(id: string): Promise<void> {
    console.log("ProjectService.delete not implemented yet");
  }

  static async addMember(
    projectId: string,
    userId: string,
    role: string = "member",
  ) {
    console.log("ProjectService.addMember not implemented yet");
    return null;
  }

  static async removeMember(projectId: string, userId: string) {
    console.log("ProjectService.removeMember not implemented yet");
  }

  static async getProjectsByUser(userId: string) {
    console.log("ProjectService.getProjectsByUser not implemented yet");
    return [];
  }
}
