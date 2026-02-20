import { Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
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
