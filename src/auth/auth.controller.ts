import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterLocalDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('local/login')
  login(@Body() createAuthDto: RegisterLocalDto) {
    const { email, password } = createAuthDto;

    const auth = this.authService.loginLocal(email, password);

    return auth;
  }

  @Post('local/register')
  register(@Body() createAuthDto: RegisterLocalDto) {
    return this.authService.registerLocal(createAuthDto);
  }
}
