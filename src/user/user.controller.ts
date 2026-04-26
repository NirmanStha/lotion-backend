import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';

import { UpdateUserDto } from './dto/update-user.dto';

import { GetUser } from 'src/common/decorator/get-user.decorator';
import { createFileInterceptor } from 'src/common/inteceptor/file-intercept.interceptor';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  findOne(@GetUser('userId') user: string) {
    console.log('this is user id in controller', typeof user, user);

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
    console.log(
      profilePic,
      updateUserDto,
      id,
      '================in controller=================',
    );

    return this.userService.update(id, {
      ...updateUserDto,
      profilePic: profilePic?.filename,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
