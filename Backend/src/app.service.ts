import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getServerStatus() {
    return {
      message: "Server running",
      status: "active",
      timestamp: new Date().toISOString(),
    };
  }

  healthCheck() {
    return {
      status: "ok",
      service: "maintenance-backend",
      timestamp: new Date().toISOString(),
    };
  }
}
