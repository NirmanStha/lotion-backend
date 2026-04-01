import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PagePremissionService } from './page-premission.service';
import { CreatePagePremissionDto } from './dto/create-page-premission.dto';
import { UpdatePagePremissionDto } from './dto/update-page-premission.dto';

@Controller('page-premission')
export class PagePremissionController {
  constructor(private readonly pagePremissionService: PagePremissionService) {}

  @Post()
  create(@Body() createPagePremissionDto: CreatePagePremissionDto) {
    return this.pagePremissionService.create(createPagePremissionDto);
  }

  @Get()
  findAll() {
    return this.pagePremissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagePremissionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePagePremissionDto: UpdatePagePremissionDto) {
    return this.pagePremissionService.update(+id, updatePagePremissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagePremissionService.remove(+id);
  }
}
