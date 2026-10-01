import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';

import { UpdateUserDto } from './dto/update-user.dto';

import { GetUser } from 'src/common/decorator/get-user.decorator';
import { SuperAdminOnly } from 'src/common/decorator/super-admin-only.decorator';
import { SuperAdminGuard } from 'src/common/gaurd/super-admin.guard';
import { createFileInterceptor } from 'src/common/inteceptor/file-intercept.interceptor';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Platform-wide user directory. Exposes every account's email via
   * authProviders, so it is restricted to super admins.
   */
  @Get('all')
  @UseGuards(SuperAdminGuard)
  @SuperAdminOnly()
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  findOne(@GetUser('userId') user: string) {
    return this.userService.findOne(user);
  }

  @Patch('me')
  @UseInterceptors(createFileInterceptor('profilePic', './uploads/profilePics'))
  updateMe(
    @GetUser('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profilePic: Express.Multer.File,
  ) {
    const id = userId;

    return this.userService.update(id, {
      ...updateUserDto,
      ...(profilePic && { profilePic: profilePic.filename }),
    });
  }

  /**
   * A user may delete their own account; deleting anyone else requires
   * super admin. Authorization is enforced in the service, which also
   * prevents removing the last super admin.
   */
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('userId') requesterId: string,
    @GetUser('isSuperAdmin') isSuperAdmin: boolean,
  ) {
    return this.userService.remove(id, requesterId, isSuperAdmin === true);
  }
}
