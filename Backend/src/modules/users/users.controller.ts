import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity, UsersService } from './users.service';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.usersService.findAllUsers().map((user) => this.sanitize(user));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sanitize(this.usersService.findUserById(id));
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.sanitize(this.usersService.createUser(body));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.sanitize(this.usersService.updateUser(id, body));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sanitize(this.usersService.removeUser(id));
  }

  private sanitize(user: UserEntity) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
