import { User } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createUser(payload: CreateUserDto, passwordHash?: string): Promise<User>;
    updateUser(id: string, payload: UpdateUserDto): Promise<User>;
    removeUser(id: string): Promise<User>;
    findAllUsers(): Promise<User[]>;
    findUserById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
}
