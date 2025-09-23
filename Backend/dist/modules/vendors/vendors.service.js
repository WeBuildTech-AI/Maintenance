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
exports.VendorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let VendorsService = class VendorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    createVendor(payload) {
        return this.prisma.vendor.create({ data: payload });
    }
    updateVendor(id, payload) {
        return this.prisma.vendor.update({ where: { id }, data: payload });
    }
    removeVendor(id) {
        return this.prisma.vendor.delete({ where: { id } });
    }
    findAllVendors() {
        return this.prisma.vendor.findMany();
    }
    findVendorById(id) {
        return this.prisma.vendor.findUniqueOrThrow({ where: { id } });
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorsService);
