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
exports.ProceduresController = void 0;
const common_1 = require("@nestjs/common");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const create_procedure_dto_1 = require("./dto/create-procedure.dto");
const update_procedure_dto_1 = require("./dto/update-procedure.dto");
const procedures_service_1 = require("./procedures.service");
let ProceduresController = class ProceduresController {
    constructor(proceduresService) {
        this.proceduresService = proceduresService;
    }
    findAll(_pagination) {
        return this.proceduresService.findAllProcedures();
    }
    findOne(id) {
        return this.proceduresService.findProcedureById(id);
    }
    create(body) {
        return this.proceduresService.createProcedure(body);
    }
    update(id, body) {
        return this.proceduresService.updateProcedure(id, body);
    }
    remove(id) {
        return this.proceduresService.removeProcedure(id);
    }
};
exports.ProceduresController = ProceduresController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_procedure_dto_1.CreateProcedureDto]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_procedure_dto_1.UpdateProcedureDto]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "remove", null);
exports.ProceduresController = ProceduresController = __decorate([
    (0, common_1.Controller)({ path: 'procedures', version: '1' }),
    __metadata("design:paramtypes", [procedures_service_1.ProceduresService])
], ProceduresController);
