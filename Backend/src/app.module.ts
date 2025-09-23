import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './database/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { TeamsModule } from './modules/teams/teams.module';
import { AssetsModule } from './modules/assets/assets.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { LocationsModule } from './modules/locations/locations.module';
import { PartsModule } from './modules/parts/parts.module';
import { MetersModule } from './modules/meters/meters.module';
import { ProceduresModule } from './modules/procedures/procedures.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AutomationsModule } from './modules/automations/automations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      expandVariables: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    TeamsModule,
    AssetsModule,
    WorkOrdersModule,
    VendorsModule,
    PurchaseOrdersModule,
    InventoryModule,
    AttachmentsModule,
    AuditLogsModule,
    LocationsModule,
    PartsModule,
    MetersModule,
    ProceduresModule,
    CategoriesModule,
    AutomationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
