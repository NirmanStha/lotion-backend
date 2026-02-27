import { ConflictException, Injectable } from '@nestjs/common';
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
  private async checkUserExists(id: string, username: string) {
    const existingUser = await this.userRepo.findOne({
      where: { id, username },
    });
    if (!existingUser) {
      throw new ConflictException('User does not exist');
    }
    return existingUser;
  }

  async create(createUserDto: CreateUserDto) {
    const { username, firstName, lastName, profilePic, age } = createUserDto;
    await this.checkUserExists('', username);

    const user = this.userRepo.create({
      username,
      firstName,
      lastName,
      profilePic,
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.checkUserExists(id, '');

    return this.userRepo.save({ ...user, ...updateUserDto });
  }

  async remove(id: string) {
    await this.checkUserExists(id, '');

    return this.userRepo.delete(id);
  }
}
