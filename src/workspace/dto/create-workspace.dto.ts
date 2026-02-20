import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
