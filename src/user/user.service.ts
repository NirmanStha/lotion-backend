import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto } from './dto/user.response.dto';
import { APIResponse } from 'src/common/dtos/api-response.dto';

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

  /**
   * Full user directory including emails. Restricted to super admins at the
   * controller - this is the endpoint that exposes every account's contact
   * details, so it must never be reachable by an ordinary authenticated user.
   */
  async findAll() {
    const users = await this.userRepo.find({
      relations: ['authProviders'],
      order: { createdAt: 'ASC' },
    });

    return APIResponse.success(
      'Users retrieved successfully',
      plainToInstance(UserResponseDto, users, {
        excludeExtraneousValues: true,
      }),
    );
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

    // Assign explicitly rather than passing the DTO to repo.update: a field
    // added to the DTO later must not become self-assignable by default.
    // isSuperAdmin is deliberately not assignable here - elevation is a
    // database operation performed at bootstrap, never a client request.
    const patch: Partial<User> = {};
    if (updateUserDto.username !== undefined)
      patch.username = updateUserDto.username;
    if (updateUserDto.firstName !== undefined)
      patch.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName !== undefined)
      patch.lastName = updateUserDto.lastName;
    if (updateUserDto.age !== undefined) patch.age = updateUserDto.age;
    if (updateUserDto.profilePic !== undefined) {
      patch.profilePic = updateUserDto.profilePic;
    }
    if (updateUserDto.isComplete !== undefined) {
      patch.isComplete = updateUserDto.isComplete;
    }

    await this.userRepo.update(id, patch);
    const updatedUser = await this.userRepo.findOne({
      where: { id },
      relations: ['authProviders'],
    });

    return plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Self-service deletion, plus super-admin deletion of any account.
   *
   * Refuses to remove the last remaining super admin, which would leave the
   * platform with no way to grant the flag again.
   */
  async remove(id: string, requesterId: string, isSuperAdmin: boolean) {
    const user = await this.checkUserExists(id);

    if (id !== requesterId && !isSuperAdmin) {
      throw new ForbiddenException('You may only delete your own account');
    }

    if (user.isSuperAdmin) {
      const superAdminCount = await this.userRepo
        .createQueryBuilder('u')
        .where('u."isSuperAdmin" = true')
        .getCount();

      if (superAdminCount <= 1) {
        throw new BadRequestException(
          'Cannot delete the last remaining super admin',
        );
      }
    }

    await this.userRepo.delete(id);

    return APIResponse.success('User deleted successfully');
  }
}
