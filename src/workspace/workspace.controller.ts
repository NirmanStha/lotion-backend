import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  create(@Body() dto: CreateWorkspaceDto, @Req() req) {
    return this.workspaceService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req) {
    return this.workspaceService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.workspaceService.findOne(id, req.user.userId);
  }

  @Get(':id/pages')
  findOneWithPages(@Param('id') id: string, @Req() req) {
    return this.workspaceService.findOneWithPages(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkspaceDto, @Req() req) {
    return this.workspaceService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.workspaceService.remove(id, req.user.userId);
  }
}
