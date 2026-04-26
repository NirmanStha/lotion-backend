import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto } from './dto/user.response.dto';

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

  findAll() {
    const users = this.userRepo.find();

    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string, name?: string): Promise<UserResponseDto | null> {
    const user = await this.userRepo.findOne({
      where: { id, firstName: name },
    });

    if (!user) {
      return null;
    }

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.checkUserExists(id);

    if (updateUserDto.username) {
      await this.checkUsernameTaken(updateUserDto.username, id);
    }

    const updatedUser = { ...user, ...updateUserDto };

    if (updateUserDto.profilePic) {
      updatedUser.profilePic = `/uploads/profilePics/${updateUserDto.profilePic}`;
    }

    if (updatedUser.firstName && updatedUser.lastName && updatedUser.age) {
      updatedUser.isComplete = true;
    }

    return this.userRepo.save(updatedUser);
  }

  async remove(id: string) {
    await this.checkUserExists(id);

    return this.userRepo.delete(id);
  }
}
