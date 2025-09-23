import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto): Promise<import("./auth.service").AuthPayload>;
    register(body: RegisterDto): Promise<import("./auth.service").AuthPayload>;
}
