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
      relations: ['authProviders'],
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

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.username) {
      await this.checkUsernameTaken(updateUserDto.username, id);
    }

    this.userRepo.update(id, updateUserDto);
    const updatedUser = await this.userRepo.findOne({
      where: { id },
      relations: ['authProviders'],
    });

    return plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string) {
    await this.checkUserExists(id);

    return this.userRepo.delete(id);
  }
}
