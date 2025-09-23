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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_service_1 = require("./app.service");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getServerStatus() {
        return this.appService.getServerStatus();
    }
    checkHealth() {
        return this.appService.healthCheck();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get server status" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Server is running successfully",
        schema: {
            type: "object",
            properties: {
                message: { type: "string", example: "Server running" },
                status: { type: "string", example: "active" },
                timestamp: { type: "string", format: "date-time" },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getServerStatus", null);
__decorate([
    (0, common_1.Get)("health"),
    (0, common_1.Version)("1"),
    (0, swagger_1.ApiOperation)({ summary: "Health check endpoint" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Health check successful",
        schema: {
            type: "object",
            properties: {
                status: { type: "string", example: "ok" },
                service: { type: "string", example: "maintenance-backend" },
                timestamp: { type: "string", format: "date-time" },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "checkHealth", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)("app"),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
