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
exports.CreateProcedureDto = exports.ProcedureFrequency = exports.ProcedureType = void 0;
const class_validator_1 = require("class-validator");
var ProcedureType;
(function (ProcedureType) {
    ProcedureType["MAINTENANCE"] = "maintenance";
    ProcedureType["INSPECTION"] = "inspection";
    ProcedureType["SAFETY_CHECK"] = "safety_check";
})(ProcedureType || (exports.ProcedureType = ProcedureType = {}));
var ProcedureFrequency;
(function (ProcedureFrequency) {
    ProcedureFrequency["DAILY"] = "daily";
    ProcedureFrequency["WEEKLY"] = "weekly";
    ProcedureFrequency["MONTHLY"] = "monthly";
    ProcedureFrequency["QUARTERLY"] = "quarterly";
    ProcedureFrequency["YEARLY"] = "yearly";
})(ProcedureFrequency || (exports.ProcedureFrequency = ProcedureFrequency = {}));
class CreateProcedureDto {
}
exports.CreateProcedureDto = CreateProcedureDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "organizationId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateProcedureDto.prototype, "assetIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ProcedureType),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ProcedureFrequency),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "frequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateProcedureDto.prototype, "files", void 0);
