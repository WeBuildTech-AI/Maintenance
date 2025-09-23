import { Injectable } from '@nestjs/common';
import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface UserDetails {
  organizationId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  passwordHash?: string;
}

export type UserEntity = StoredEntity<UserDetails>;

@Injectable()
export class UsersService extends BaseInMemoryService<UserDetails> {
  createUser(payload: CreateUserDto, passwordHash?: string): UserEntity {
    const { password, ...rest } = payload;
    return super.create({
      ...rest,
      passwordHash: passwordHash ?? password,
    });
  }

  updateUser(id: string, payload: UpdateUserDto): UserEntity {
    return super.update(id, payload);
  }

  removeUser(id: string): UserEntity {
    return super.remove(id);
  }

  findAllUsers(): UserEntity[] {
    return super.findAll();
  }

  findUserById(id: string): UserEntity {
    return super.findOne(id);
  }

  findByEmail(email: string): UserEntity | undefined {
    return this.findAllUsers().find((user) => user.email === email);
  }
}
