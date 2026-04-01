import { PartialType } from '@nestjs/mapped-types';
import { CreatePagePremissionDto } from './create-page-premission.dto';

export class UpdatePagePremissionDto extends PartialType(CreatePagePremissionDto) {}
