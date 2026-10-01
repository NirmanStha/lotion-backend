import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { CreatePagePremissionDto } from './dto/create-page-premission.dto';
import { UpdatePagePremissionDto } from './dto/update-page-premission.dto';
import { PagePremissionService } from './page-premission.service';

@Controller('page-premission')
export class PagePremissionController {
  constructor(private readonly pagePremissionService: PagePremissionService) {}

  @Post()
  create(
    @Body() dto: CreatePagePremissionDto,
    @GetUser('userId') userId: string,
  ) {
    return this.pagePremissionService.create(dto, userId);
  }

  @Get('page/:pageId')
  findAllByPage(
    @Param('pageId') pageId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.pagePremissionService.findAllByPage(pageId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.pagePremissionService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePagePremissionDto,
    @GetUser('userId') userId: string,
  ) {
    return this.pagePremissionService.update(id, dto.role, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.pagePremissionService.remove(id, userId);
  }
}
