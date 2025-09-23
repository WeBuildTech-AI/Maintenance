import { UserEntity, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export interface AuthPayload {
    accessToken: string;
    user: Omit<UserEntity, 'passwordHash'>;
}
export declare class AuthService {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(payload: RegisterDto): AuthPayload;
    login(payload: LoginDto): AuthPayload;
    private buildAuthPayload;
    private hashPassword;
    private generateToken;
}
