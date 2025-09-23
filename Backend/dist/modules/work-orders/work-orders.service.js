"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkOrdersService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const base_in_memory_service_1 = require("../../common/base-in-memory.service");
let WorkOrdersService = class WorkOrdersService extends base_in_memory_service_1.BaseInMemoryService {
    createWorkOrder(payload) {
        return super.create({
            ...payload,
            comments: [],
        });
    }
    updateWorkOrder(id, payload) {
        return super.update(id, payload);
    }
    removeWorkOrder(id) {
        return super.remove(id);
    }
    findAllWorkOrders() {
        return super.findAll();
    }
    findWorkOrderById(id) {
        return super.findOne(id);
    }
    assignWorkOrder(id, payload) {
        const workOrder = this.findWorkOrderById(id);
        return super.update(id, {
            ...workOrder,
            assigneeIds: payload.assigneeIds,
        });
    }
    addWorkOrderComment(id, payload) {
        var _a;
        const workOrder = this.findWorkOrderById(id);
        const comment = {
            id: (0, crypto_1.randomUUID)(),
            authorId: payload.authorId,
            message: payload.message,
            createdAt: new Date().toISOString(),
        };
        return super.update(id, {
            ...workOrder,
            comments: [...((_a = workOrder.comments) !== null && _a !== void 0 ? _a : []), comment],
        });
    }
    updatePriority(id, priority) {
        return super.update(id, { priority });
    }
};
exports.WorkOrdersService = WorkOrdersService;
exports.WorkOrdersService = WorkOrdersService = __decorate([
    (0, common_1.Injectable)()
], WorkOrdersService);
