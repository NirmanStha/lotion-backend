import { Controller, Get, Post, Body, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterLocalDto } from './dto/create-auth.dto';
import type { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('local/login')
  async login(
    @Body() createAuthDto: RegisterLocalDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = createAuthDto;

    const auth = await this.authService.loginLocal(email, password);

    res.cookie('access_token', auth.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', auth.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'Login successful' };
  }

  @Public()
  @Post('local/register')
  register(@Body() createAuthDto: RegisterLocalDto) {
    return this.authService.registerLocal(createAuthDto);
  }

  @Get('profile')
  getProfile() {
    // This is a placeholder. You would need to implement logic to get the authenticated user's profile.
    return { message: 'User profile endpoint' };
  }

  @Post('refresh')
  async refreshTokens(@Res({ passthrough: true }) res: Response) {
    const refreshToken = res.req.cookies?.['refresh_token'];
    if (!refreshToken) {
      return { message: 'No refresh token provided' };
    }

    try {
      const auth = await this.authService.refreshToken(refreshToken);

      res.cookie('access_token', auth.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', auth.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return { message: 'Tokens refreshed successfully' };
    } catch (error) {
      return { message: 'Invalid refresh token' };
    }
  }
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const refreshToken = res.req.cookies?.['refresh_token'];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged out successfully' };
  }
}
