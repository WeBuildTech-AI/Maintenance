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
exports.MetersController = void 0;
const common_1 = require("@nestjs/common");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const create_meter_dto_1 = require("./dto/create-meter.dto");
const update_meter_dto_1 = require("./dto/update-meter.dto");
const meters_service_1 = require("./meters.service");
let MetersController = class MetersController {
    constructor(metersService) {
        this.metersService = metersService;
    }
    findAll(_pagination) {
        return this.metersService.findAllMeters();
    }
    findOne(id) {
        return this.metersService.findMeterById(id);
    }
    create(body) {
        return this.metersService.createMeter(body);
    }
    update(id, body) {
        return this.metersService.updateMeter(id, body);
    }
};
exports.MetersController = MetersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], MetersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MetersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_meter_dto_1.CreateMeterDto]),
    __metadata("design:returntype", void 0)
], MetersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_meter_dto_1.UpdateMeterDto]),
    __metadata("design:returntype", void 0)
], MetersController.prototype, "update", null);
exports.MetersController = MetersController = __decorate([
    (0, common_1.Controller)({ path: 'meters', version: '1' }),
    __metadata("design:paramtypes", [meters_service_1.MetersService])
], MetersController);
