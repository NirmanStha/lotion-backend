import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { Repository } from 'typeorm';
import { Page } from 'src/page/entities/page.entity';
import {
  CollaboratorRole,
  WorkspaceCollaborator,
} from 'src/collaborator/entities/collaborator.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(WorkspaceCollaborator)
    private readonly collaboratorRepo: Repository<WorkspaceCollaborator>,
  ) {}

  private async checkExistingWorkspace(name: string, userId: string) {
    const workspace = await this.workspaceRepo.findOne({
      where: { name, owner: { id: userId } },
    });

    if (workspace) {
      throw new ConflictException(`Workspace with ID ${name} already exists`);
    }
  }
  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string) {
    const { name, icon, description } = createWorkspaceDto;
    await this.checkExistingWorkspace(name, userId);

    const workspace = this.workspaceRepo.create({
      name,
      icon,
      description,
      owner: { id: userId },
    });
    const savedWorkspace = await this.workspaceRepo.save(workspace);
    const collaborator = this.collaboratorRepo.create({
      workspace: savedWorkspace,
      user: { id: userId },
      role: CollaboratorRole.OWNER,
    });
    await this.collaboratorRepo.save(collaborator);
    return savedWorkspace;
  }

  //get all workspaces for a user
  async findAll(userId: string) {
    return this.workspaceRepo
      .createQueryBuilder('workspace')
      .leftJoinAndSelect('workspace.owner', 'owner')
      .leftJoinAndSelect('workspace.collaborators', 'collab')
      .leftJoinAndSelect('collab.user', 'collabUser')
      .where('owner.id = :userId', { userId })
      .orWhere('collabUser.id = :userId', { userId })
      .getMany();
  }

  async findOne(workspaceId: string, userId: string) {
    const workspace = await this.workspaceRepo.findOne({
      where: {
        id: workspaceId,
        owner: { id: userId },
      },
      relations: ['owner', 'collaborators'],
    });

    if (!workspace) {
      throw new Error(`Workspace with ID ${workspaceId} not found`);
    }
    return workspace;
  }

  async findOneWithPages(workspaceId: string, userId: string) {
    const workspace = await this.workspaceRepo.findOne({
      where: {
        id: workspaceId,
        owner: { id: userId },
      },
      relations: ['owner', 'collaborators', 'pages'],
    });

    if (!workspace) {
      throw new Error(`Workspace with ID ${workspaceId} not found`);
    }
    return workspace;
  }
  //get one workspace by id
  //   findOne(workspaceId: string, userId: string) {
  //     const workspace = this.prisma.workspace.findUnique({
  // where: {
  //   id: workspaceId,
  //   OR: [
  //     { ownerId: userId }, // User is the owner
  //     { collaborators: { some: { userId } } }, // User is a collaborator
  //   ],
  // },
  // include: {
  //   owner: {
  //     select: {
  //       id: true,
  //       firstName: true,
  //       lastName: true,
  //       profilePic: true,
  //     },
  //   },
  //   collaborators: {
  //     include: {
  //       user: {
  //         select: {
  //           id: true,
  //           firstName: true,
  //           lastName: true,
  //           profilePic: true,
  //         },
  //       },
  //     },
  //   },
  //   _count: {
  //     select: {
  //       pages: true,
  //     },
  //   },
  //     });
  //     return workspace;
  //   }

  async update(
    id: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
    userId: string,
  ) {
    const workspace = await this.workspaceRepo.findOne({
      where: {
        id,
        owner: { id: userId },
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }
    return this.workspaceRepo.save({
      ...workspace,
      ...updateWorkspaceDto,
    });
  }

  async remove(id: string, userId: string) {
    const workspace = await this.workspaceRepo.findOne({
      where: {
        id,
        owner: { id: userId },
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    await this.workspaceRepo.remove(workspace);
    return `Workspace with ID ${id} removed`;
  }
}
