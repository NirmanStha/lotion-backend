import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceService } from './workspace.service';
import { createFileInterceptor } from 'src/common/inteceptor/file-intercept.interceptor';

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

  @Patch(':id')
  @UseInterceptors(createFileInterceptor('icon', './uploads/workspaceIcons'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @GetUser('userId') userId: string,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    console.log('this is controller', icon);
    return this.workspaceService.update(id, dto, userId, icon?.filename);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.workspaceService.remove(id, userId);
  }
}
