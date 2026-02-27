import { PartialType } from '@nestjs/mapped-types';
import { RegisterLocalDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(RegisterLocalDto) {}
