import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(payload: CreateUserDto, passwordHash?: string): Promise<User> {
    const { password, ...rest } = payload;
    return this.prisma.user.create({
      data: {
        ...rest,
        passwordHash: passwordHash ?? password ?? null,
      },
    });
  }

  async updateUser(id: string, payload: UpdateUserDto): Promise<User> {
    const { password, ...rest } = payload;
    const data: Prisma.UserUpdateInput = {
      ...rest,
    };

    if (password) {
      data.passwordHash = password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async removeUser(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findUserById(id: string): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
