import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterLocalDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  username!: string;
}

export enum AuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  LOCAL = 'local',
}

export class OAuthLoginDto {
  @IsEnum(AuthProvider)
  provider!: AuthProvider;

  @IsString()
  @IsNotEmpty()
  accessToken!: string; // or idToken
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
