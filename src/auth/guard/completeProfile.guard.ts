import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

import { Request } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ProfileCompleteGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const user = req.user; // assuming you have JwtAuthGuard or similar

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const dbUser = await this.userService.findById(user.sub);
    if (!dbUser.profileCompleted) {
      throw new ForbiddenException(
        'Complete your profile to access this resource',
      );
    }

    return true;
  }
}
