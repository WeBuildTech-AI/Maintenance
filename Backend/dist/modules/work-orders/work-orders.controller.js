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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkOrdersController = void 0;
const common_1 = require("@nestjs/common");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const assign_work_order_dto_1 = require("./dto/assign-work-order.dto");
const create_work_order_dto_1 = require("./dto/create-work-order.dto");
const create_work_order_comment_dto_1 = require("./dto/create-work-order-comment.dto");
const update_work_order_dto_1 = require("./dto/update-work-order.dto");
const work_orders_service_1 = require("./work-orders.service");
let WorkOrdersController = class WorkOrdersController {
    constructor(workOrdersService) {
        this.workOrdersService = workOrdersService;
    }
    findAll(_pagination) {
        return this.workOrdersService.findAllWorkOrders();
    }
    findOne(id) {
        return this.workOrdersService.findWorkOrderById(id);
    }
    create(body) {
        return this.workOrdersService.createWorkOrder(body);
    }
    update(id, body) {
        return this.workOrdersService.updateWorkOrder(id, body);
    }
    remove(id) {
        return this.workOrdersService.removeWorkOrder(id);
    }
    assign(id, body) {
        return this.workOrdersService.assignWorkOrder(id, body);
    }
    comment(id, body) {
        return this.workOrdersService.addWorkOrderComment(id, body);
    }
};
exports.WorkOrdersController = WorkOrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_work_order_dto_1.CreateWorkOrderDto]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_work_order_dto_1.UpdateWorkOrderDto]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_work_order_dto_1.AssignWorkOrderDto]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/comment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_work_order_comment_dto_1.CreateWorkOrderCommentDto]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "comment", null);
exports.WorkOrdersController = WorkOrdersController = __decorate([
    (0, common_1.Controller)({ path: 'work-orders', version: '1' }),
    __metadata("design:paramtypes", [work_orders_service_1.WorkOrdersService])
], WorkOrdersController);
