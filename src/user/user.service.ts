import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  // 1. Verify a user exists by their unique ID
  private async checkUserExists(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      // Note: Use NotFoundException if the user is missing
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // 2. Prevent duplicate usernames
  private async checkUsernameTaken(username: string, currentUserId?: string) {
    const existingUser = await this.userRepo.findOne({ where: { username } });

    // If we find a user AND it's not the user currently making the update
    if (existingUser && existingUser.id !== currentUserId) {
      throw new ConflictException('Username already taken');
    }
  }

  async create(createUserDto: CreateUserDto, profilePic?: string) {
    const { username, firstName, lastName, age } = createUserDto;
    const profilePicUrl = profilePic
      ? `https://lotion.s3.amazonaws.com/${profilePic}`
      : undefined;

    await this.checkUsernameTaken(username);
    const user = this.userRepo.create({
      username,
      firstName,
      lastName,
      profilePic: profilePicUrl,
      age,
    });
    return this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find();
  }

  findOne(id: string, name?: string) {
    return this.userRepo.findOne({ where: { id, firstName: name } });
  }

  async update(id: string, updateUserDto: UpdateUserDto, profilePic?: string) {
    const user = await this.checkUserExists(id);

    const updatedUser = { ...user, ...updateUserDto };
    if (profilePic) {
      updatedUser.profilePic = `https://lotion.s3.amazonaws.com/${profilePic}`;
    }

    return this.userRepo.save({
      ...user,
      ...updatedUser,
    });
  }

  async remove(id: string) {
    await this.checkUserExists(id);

    return this.userRepo.delete(id);
  }
}
