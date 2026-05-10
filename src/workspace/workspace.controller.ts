import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { createFileInterceptor } from 'src/common/inteceptor/file-intercept.interceptor';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceService } from './workspace.service';
import { PoliciesGuard } from 'src/access-control/gaurd/policies.gaurd';
import { CheckPolicy } from 'src/access-control/decorator/check-policy.decorator';
import { PolicyMeta } from 'src/access-control/decorator/policy-meta.decorator';
import { WorkspacePermission } from 'src/access-control/enums/permission.enum';
import { WorkspaceCrudPolicy } from './policies/workspace-crud.policy';
import { DeleteWorkspacePolicy } from 'src/access-control/policies/workspace/workspace.delete.policy';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}
  @Post()
  @UseInterceptors(createFileInterceptor('icon', './uploads/workspaceIcons'))
  create(
    @Body() dto: CreateWorkspaceDto,
    @GetUser('userId') userId: string,
    @UploadedFile() icon?: Express.Multer.File, // Note: icon will be undefined if filter fails
  ) {
    const workspaceData = {
      ...dto,
      icon: icon?.filename,
    };

    return this.workspaceService.create(workspaceData, userId);
  }
  @Get()
  findAll(@GetUser('userId') userId: string) {
    return this.workspaceService.findAll(userId);
  }
  @Get(':id/pages')
  findOneWithPages(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.workspaceService.findOneWithPages(id, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.workspaceService.findOne(id, userId);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicy(WorkspaceCrudPolicy)
  @PolicyMeta({ permission: WorkspacePermission.UPDATE, param: 'id' })
  @Patch(':id')
  @UseInterceptors(createFileInterceptor('icon', './uploads/workspaceIcons'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @GetUser('userId') userId: string,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    console.log('this is controller', dto);
    return this.workspaceService.update(id, dto, userId, icon?.filename);
  }

  @Delete(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicy(DeleteWorkspacePolicy)
  remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.workspaceService.remove(id, userId);
  }
}
