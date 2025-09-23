import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export interface AuthPayload {
    accessToken: string;
    user: Omit<User, 'passwordHash'>;
}
export declare class AuthService {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(payload: RegisterDto): Promise<AuthPayload>;
    login(payload: LoginDto): Promise<AuthPayload>;
    private buildAuthPayload;
    private hashPassword;
    private generateToken;
}
