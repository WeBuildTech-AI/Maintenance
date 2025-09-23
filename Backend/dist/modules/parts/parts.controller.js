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
exports.PartsController = void 0;
const common_1 = require("@nestjs/common");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const create_part_dto_1 = require("./dto/create-part.dto");
const update_part_dto_1 = require("./dto/update-part.dto");
const parts_service_1 = require("./parts.service");
let PartsController = class PartsController {
    constructor(partsService) {
        this.partsService = partsService;
    }
    findAll(_pagination) {
        return this.partsService.findAllParts();
    }
    findOne(id) {
        return this.partsService.findPartById(id);
    }
    create(body) {
        return this.partsService.createPart(body);
    }
    update(id, body) {
        return this.partsService.updatePart(id, body);
    }
    remove(id) {
        return this.partsService.removePart(id);
    }
};
exports.PartsController = PartsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_part_dto_1.CreatePartDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_part_dto_1.UpdatePartDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "remove", null);
exports.PartsController = PartsController = __decorate([
    (0, common_1.Controller)({ path: 'parts', version: '1' }),
    __metadata("design:paramtypes", [parts_service_1.PartsService])
], PartsController);
