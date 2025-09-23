"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const common_2 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix("api");
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: "1",
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Maintenance Platform API')
        .setDescription('API documentation for the Maintenance Management Platform')
        .setVersion('1.0')
        .addTag('maintenance', 'Maintenance management endpoints')
        .addTag('assets', 'Asset management endpoints')
        .addTag('work-orders', 'Work order management endpoints')
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management endpoints')
        .addTag('organizations', 'Organization management endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: 'Maintenance Platform API Docs',
        customfavIcon: '/favicon.ico',
        customCss: '.swagger-ui .topbar { display: none }',
    });
    const port = configService.get("PORT", 3000);
    await app.listen(port);
    common_2.Logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1/health`, "Bootstrap");
    common_2.Logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`, "Bootstrap");
}
bootstrap();
