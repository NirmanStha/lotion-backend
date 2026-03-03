import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsNumber()
  age?: number;
}
