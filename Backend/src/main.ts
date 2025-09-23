import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);

  app.setGlobalPrefix("api");

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle("Maintenance Platform API")
    .setDescription("API documentation for the Maintenance Management Platform")
    .setVersion("1.0")
    .addTag("maintenance", "Maintenance management endpoints")
    .addTag("assets", "Asset management endpoints")
    .addTag("work-orders", "Work order management endpoints")
    .addTag("auth", "Authentication endpoints")
    .addTag("users", "User management endpoints")
    .addTag("organizations", "Organization management endpoints")
    .addTag("teams", "Team management endpoints")
    .addTag("team-members", "Team member management endpoints")
    .addTag("vendors", "Vendor management endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    customSiteTitle: "Maintenance Platform API Docs",
    customfavIcon: "/favicon.ico",
    customCss: ".swagger-ui .topbar { display: none }",
  });

  const port = configService.get<number>("PORT", 3000);
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/api/v1/health`,
    "Bootstrap"
  );
  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/api/docs`,
    "Bootstrap"
  );
}

bootstrap();
