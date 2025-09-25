import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash, randomUUID } from "crypto";
import { User } from "@prisma/client";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

export interface AuthPayload {
  accessToken: string;
  user: Omit<User, "passwordHash">;
}

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(payload: RegisterDto): Promise<AuthPayload> {
    const existingUser = await this.usersService.findByEmail(payload.email);
    if (existingUser) {
      throw new ConflictException("Email is already registered.");
    }

    const user = await this.usersService.createUser(payload);
    return this.buildAuthPayload(user);
  }

  async login(payload: LoginDto): Promise<AuthPayload> {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const passwordHash = user.passwordHash;
    if (!passwordHash || passwordHash !== this.hashPassword(payload.password)) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    return this.buildAuthPayload(user);
  }

  private buildAuthPayload(user: User): AuthPayload {
    const { passwordHash, ...safeUser } = user;
    return {
      accessToken: this.generateToken(user.id),
      user: safeUser,
    };
  }

  private hashPassword(password: string) {
    return createHash("sha256").update(password).digest("hex");
  }

  private generateToken(userId: string) {
    const nonce = randomUUID();
    return Buffer.from(`${userId}:${nonce}`).toString("base64url");
  }
}
