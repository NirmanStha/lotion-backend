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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/common/gaurd/jwt.auth.gaurd';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceService } from './workspace.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}
  @Post()
  @UseInterceptors(
    FileInterceptor('icon', {
      storage: diskStorage({
        destination: './uploads/workspaceIcons',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          // Use extname to safely get the extension with the dot
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Unsupported file type'), false);
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Body() dto: CreateWorkspaceDto,
    @GetUser('userId') userId: string,
    @UploadedFile() icon?: Express.Multer.File, // Note: icon will be undefined if filter fails
  ) {
    if (!icon) {
      throw new BadRequestException('Icon file is required or invalid format');
    }

    const workspaceData = {
      ...dto,
      icon: icon.filename,
    };

    return this.workspaceService.create(workspaceData, userId);

    console.log('Success:', workspaceData);
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
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @GetUser() userId: string,
  ) {
    return this.workspaceService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.workspaceService.remove(id, userId);
  }
}
