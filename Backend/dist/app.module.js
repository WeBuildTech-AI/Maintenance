"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const configuration_1 = __importDefault(require("./config/configuration"));
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const organizations_module_1 = require("./modules/organizations/organizations.module");
const teams_module_1 = require("./modules/teams/teams.module");
const assets_module_1 = require("./modules/assets/assets.module");
const work_orders_module_1 = require("./modules/work-orders/work-orders.module");
const vendors_module_1 = require("./modules/vendors/vendors.module");
const purchase_orders_module_1 = require("./modules/purchase-orders/purchase-orders.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const attachments_module_1 = require("./modules/attachments/attachments.module");
const audit_logs_module_1 = require("./modules/audit-logs/audit-logs.module");
const locations_module_1 = require("./modules/locations/locations.module");
const parts_module_1 = require("./modules/parts/parts.module");
const meters_module_1 = require("./modules/meters/meters.module");
const procedures_module_1 = require("./modules/procedures/procedures.module");
const categories_module_1 = require("./modules/categories/categories.module");
const automations_module_1 = require("./modules/automations/automations.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                expandVariables: true,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            teams_module_1.TeamsModule,
            assets_module_1.AssetsModule,
            work_orders_module_1.WorkOrdersModule,
            vendors_module_1.VendorsModule,
            purchase_orders_module_1.PurchaseOrdersModule,
            inventory_module_1.InventoryModule,
            attachments_module_1.AttachmentsModule,
            audit_logs_module_1.AuditLogsModule,
            locations_module_1.LocationsModule,
            parts_module_1.PartsModule,
            meters_module_1.MetersModule,
            procedures_module_1.ProceduresModule,
            categories_module_1.CategoriesModule,
            automations_module_1.AutomationsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
