import { Injectable } from '@nestjs/common';
import { CreatePagePremissionDto } from './dto/create-page-premission.dto';
import { UpdatePagePremissionDto } from './dto/update-page-premission.dto';

@Injectable()
export class PagePremissionService {
  create(createPagePremissionDto: CreatePagePremissionDto) {
    return 'This action adds a new pagePremission';
  }

  findAll() {
    return `This action returns all pagePremission`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pagePremission`;
  }

  update(id: number, updatePagePremissionDto: UpdatePagePremissionDto) {
    return `This action updates a #${id} pagePremission`;
  }

  remove(id: number) {
    return `This action removes a #${id} pagePremission`;
  }
}
