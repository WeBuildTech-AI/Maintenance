"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async register(payload) {
        const existingUser = await this.usersService.findByEmail(payload.email);
        if (existingUser) {
            throw new common_1.ConflictException('Email is already registered.');
        }
        const passwordHash = this.hashPassword(payload.password);
        const user = await this.usersService.createUser(payload, passwordHash);
        return this.buildAuthPayload(user);
    }
    async login(payload) {
        const user = await this.usersService.findByEmail(payload.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        const passwordHash = user.passwordHash;
        if (!passwordHash || passwordHash !== this.hashPassword(payload.password)) {
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        return this.buildAuthPayload(user);
    }
    buildAuthPayload(user) {
        const { passwordHash, ...safeUser } = user;
        return {
            accessToken: this.generateToken(user.id),
            user: safeUser,
        };
    }
    hashPassword(password) {
        return (0, crypto_1.createHash)('sha256').update(password).digest('hex');
    }
    generateToken(userId) {
        const nonce = (0, crypto_1.randomUUID)();
        return Buffer.from(`${userId}:${nonce}`).toString('base64url');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AuthService);
