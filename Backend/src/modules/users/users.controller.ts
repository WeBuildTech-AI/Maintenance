import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() _pagination: PaginationQueryDto) {
    const users = await this.usersService.findAllUsers();
    return users.map((user) => this.sanitize(user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findUserById(id);
    return this.sanitize(user);
  }

  @Post()
  async create(@Body() body: CreateUserDto) {
    const user = await this.usersService.createUser(body);
    return this.sanitize(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, body);
    return this.sanitize(user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.usersService.removeUser(id);
    return this.sanitize(user);
  }

  private sanitize(user: User) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
