import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CollaboratorService } from './collaborator.service';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { GetUser } from 'src/common/decorator/get-user.decorator';

@Controller('collaborator')
export class CollaboratorController {
  constructor(private readonly collaboratorService: CollaboratorService) {}

  @Post()
  create(
    @Body() createCollaboratorDto: CreateCollaboratorDto,
    @GetUser('userId') userId: string,
  ) {
    return this.collaboratorService.create(createCollaboratorDto, userId);
  }

  @Get()
  findAll() {
    return this.collaboratorService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id')
    @GetUser('userId')
    userId: string,
    id: string,
  ) {
    return this.collaboratorService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCollaboratorDto: UpdateCollaboratorDto,
    @GetUser('userId') userId: string,
  ) {
    return this.collaboratorService.update(id, updateCollaboratorDto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id')
    @GetUser('userId')
    userId: string,
    id: string,
  ) {
    return this.collaboratorService.remove(id, userId);
  }
}
