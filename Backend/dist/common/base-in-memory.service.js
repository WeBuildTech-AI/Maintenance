"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseInMemoryService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let BaseInMemoryService = class BaseInMemoryService {
    constructor() {
        this.items = new Map();
    }
    findAll() {
        return Array.from(this.items.values());
    }
    findOne(id) {
        const entity = this.items.get(id);
        if (!entity) {
            throw new common_1.NotFoundException(`Resource with id '${id}' was not found.`);
        }
        return entity;
    }
    create(payload) {
        const now = new Date();
        const entity = {
            ...payload,
            id: (0, crypto_1.randomUUID)(),
            createdAt: now,
            updatedAt: now,
        };
        this.items.set(entity.id, entity);
        return entity;
    }
    update(id, payload) {
        const existing = this.findOne(id);
        const updated = {
            ...existing,
            ...payload,
            id,
            updatedAt: new Date(),
        };
        this.items.set(id, updated);
        return updated;
    }
    remove(id) {
        const existing = this.findOne(id);
        this.items.delete(id);
        return existing;
    }
};
exports.BaseInMemoryService = BaseInMemoryService;
exports.BaseInMemoryService = BaseInMemoryService = __decorate([
    (0, common_1.Injectable)()
], BaseInMemoryService);
