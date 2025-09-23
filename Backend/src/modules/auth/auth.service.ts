import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { UserEntity, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthPayload {
  accessToken: string;
  user: Omit<UserEntity, 'passwordHash'>;
}

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  register(payload: RegisterDto): AuthPayload {
    const existingUser = this.usersService.findByEmail(payload.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const passwordHash = this.hashPassword(payload.password);
    const user = this.usersService.createUser(payload, passwordHash);
    return this.buildAuthPayload(user);
  }

  login(payload: LoginDto): AuthPayload {
    const user = this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordHash = user.passwordHash;
    if (!passwordHash || passwordHash !== this.hashPassword(payload.password)) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.buildAuthPayload(user);
  }

  private buildAuthPayload(user: UserEntity): AuthPayload {
    const { passwordHash, ...safeUser } = user;
    return {
      accessToken: this.generateToken(user.id),
      user: safeUser,
    };
  }

  private hashPassword(password: string) {
    return createHash('sha256').update(password).digest('hex');
  }

  private generateToken(userId: string) {
    const nonce = randomUUID();
    return Buffer.from(`${userId}:${nonce}`).toString('base64url');
  }
}
