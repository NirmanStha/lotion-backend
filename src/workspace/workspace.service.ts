import { Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}
  async create(userId: string, createWorkspaceDto: CreateWorkspaceDto) {
    const wp = await this.prisma.workspace.create({
      data: {
        ...createWorkspaceDto,
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        _count: {
          select: {
            pages: true,
            collaborators: true,
          },
        },
      },
    });
    return wp;
  }
  // Get all workspaces for a user (owned + collaborated)
  async getUserWorkspaces(userId: string) {
    const wp = await this.prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId }, // Workspaces user owns
          { collaborators: { some: { userId } } }, // Workspaces user collaborates on
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePic: true,
              },
            },
          },
        },
        _count: {
          select: {
            pages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return wp;
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

  update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    return `This action updates a #${id} workspace`;
  }

  remove(id: number) {
    return `This action removes a #${id} workspace`;
  }
}
