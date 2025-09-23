import { Controller, Get, Version } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("app")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: "Get server status" })
  @ApiResponse({
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
  })
  getServerStatus() {
    return this.appService.getServerStatus();
  }

  @Get("health")
  @Version("1")
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({
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
  })
  checkHealth() {
    return this.appService.healthCheck();
  }
}
