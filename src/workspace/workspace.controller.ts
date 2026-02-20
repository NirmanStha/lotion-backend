import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @Body('userId') userId: string,
  ) {
    return this.workspaceService.create(userId, createWorkspaceDto);
  }

  @Get()
  findAll(@Body('userId') userId: string) {
    return this.workspaceService.getUserWorkspaces(userId);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.workspaceService.findOne(+id);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(+id, updateWorkspaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workspaceService.remove(+id);
  }
}
