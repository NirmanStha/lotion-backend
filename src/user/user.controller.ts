import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { diskStorage } from 'multer';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post('create')
  // @UseInterceptors(FileInterceptor('profilePic'))
  // create(
  //   @Body() createUserDto: CreateUserDto,
  //   @UploadedFile() profilePic: Express.Multer.File,
  // ) {
  //   return this.userService.create(createUserDto, profilePic?.filename);
  // }

  @Get('all')
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  findOne(@Req() req: Request) {
    return this.userService.findOne(req?.user?.['userId']);
  }

  @Patch('me')
  @UseInterceptors(
    FileInterceptor('profilePic', {
      storage: diskStorage({
        destination: './uploads/profilePics',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Only image files allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  updateMe(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profilePic: Express.Multer.File,
  ) {
    const id = req?.user?.['userId'];
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
