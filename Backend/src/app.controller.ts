import { Controller, Get, Version } from '@nestjs/common';
import { AppService } from './app.service';

@Controller({ path: 'health' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Version('1')
  checkHealth() {
    return this.appService.healthCheck();
  }
}
