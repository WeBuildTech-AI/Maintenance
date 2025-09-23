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
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const toInputJson = (value) => value === undefined ? undefined : value;
let PurchaseOrdersService = class PurchaseOrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    createPurchaseOrder(payload) {
        const data = {
            organization: { connect: { id: payload.organizationId } },
            vendor: { connect: { id: payload.vendorId } },
            status: payload.status,
            items: payload.items,
            taxesAndCosts: toInputJson(payload.taxesAndCosts),
            shippingAddress: payload.shippingAddress,
            billingAddress: payload.billingAddress,
            shippingContact: toInputJson(payload.shippingContact),
            dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
            notes: payload.notes,
            files: payload.files,
        };
        return this.prisma.purchaseOrder.create({ data });
    }
    updatePurchaseOrder(id, payload) {
        const data = {
            ...(payload.organizationId
                ? { organization: { connect: { id: payload.organizationId } } }
                : {}),
            ...(payload.vendorId ? { vendor: { connect: { id: payload.vendorId } } } : {}),
            status: payload.status,
            items: payload.items !== undefined ? payload.items : undefined,
            taxesAndCosts: payload.taxesAndCosts !== undefined ? toInputJson(payload.taxesAndCosts) : undefined,
            shippingAddress: payload.shippingAddress,
            billingAddress: payload.billingAddress,
            shippingContact: payload.shippingContact !== undefined ? toInputJson(payload.shippingContact) : undefined,
            dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
            notes: payload.notes,
            files: payload.files,
        };
        return this.prisma.purchaseOrder.update({
            where: { id },
            data,
        });
    }
    findAllPurchaseOrders() {
        return this.prisma.purchaseOrder.findMany();
    }
    findPurchaseOrderById(id) {
        return this.prisma.purchaseOrder.findUniqueOrThrow({ where: { id } });
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseOrdersService);
