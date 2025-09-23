"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const base_in_memory_service_1 = require("../../common/base-in-memory.service");
let UsersService = class UsersService extends base_in_memory_service_1.BaseInMemoryService {
    createUser(payload, passwordHash) {
        const { password, ...rest } = payload;
        return super.create({
            ...rest,
            passwordHash: passwordHash !== null && passwordHash !== void 0 ? passwordHash : password,
        });
    }
    updateUser(id, payload) {
        return super.update(id, payload);
    }
    removeUser(id) {
        return super.remove(id);
    }
    findAllUsers() {
        return super.findAll();
    }
    findUserById(id) {
        return super.findOne(id);
    }
    findByEmail(email) {
        return this.findAllUsers().find((user) => user.email === email);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
