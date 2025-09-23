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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUser(payload, passwordHash) {
        var _a;
        const { password, ...rest } = payload;
        return this.prisma.user.create({
            data: {
                ...rest,
                passwordHash: (_a = passwordHash !== null && passwordHash !== void 0 ? passwordHash : password) !== null && _a !== void 0 ? _a : null,
            },
        });
    }
    async updateUser(id, payload) {
        const { password, ...rest } = payload;
        const data = {
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
    async removeUser(id) {
        return this.prisma.user.delete({ where: { id } });
    }
    async findAllUsers() {
        return this.prisma.user.findMany();
    }
    async findUserById(id) {
        return this.prisma.user.findUniqueOrThrow({ where: { id } });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
