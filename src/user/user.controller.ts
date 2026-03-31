import {
  BadRequestException,
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

import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user.dto';

import { diskStorage } from 'multer';
import { GetUser } from 'src/common/decorator/get-user.decorator';
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
  findOne(@GetUser('userId') user: string) {
    console.log('this is user id in controller', typeof user, user);

    return this.userService.findOne(user);
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
