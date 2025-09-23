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
exports.WorkOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let WorkOrdersService = class WorkOrdersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.defaultInclude = { comments: true };
    }
    createWorkOrder(payload) {
        return this.prisma.workOrder.create({
            data: payload,
            include: this.defaultInclude,
        });
    }
    updateWorkOrder(id, payload) {
        return this.prisma.workOrder.update({
            where: { id },
            data: payload,
            include: this.defaultInclude,
        });
    }
    removeWorkOrder(id) {
        return this.prisma.workOrder.delete({
            where: { id },
            include: this.defaultInclude,
        });
    }
    findAllWorkOrders() {
        return this.prisma.workOrder.findMany({ include: this.defaultInclude });
    }
    findWorkOrderById(id) {
        return this.prisma.workOrder.findUniqueOrThrow({
            where: { id },
            include: this.defaultInclude,
        });
    }
    assignWorkOrder(id, payload) {
        return this.prisma.workOrder.update({
            where: { id },
            data: { assigneeIds: payload.assigneeIds },
            include: this.defaultInclude,
        });
    }
    async addWorkOrderComment(id, payload) {
        await this.prisma.workOrderComment.create({
            data: {
                workOrderId: id,
                authorId: payload.authorId,
                message: payload.message,
            },
        });
        return this.findWorkOrderById(id);
    }
    updatePriority(id, priority) {
        return this.prisma.workOrder.update({
            where: { id },
            data: { priority },
            include: this.defaultInclude,
        });
    }
};
exports.WorkOrdersService = WorkOrdersService;
exports.WorkOrdersService = WorkOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkOrdersService);
