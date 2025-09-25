import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';

@Controller({ path: 'automations', version: '1' })
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.automationsService.findAllAutomations();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.automationsService.findAutomationById(id);
  }

  @Post()
  create(@Body() body: CreateAutomationDto) {
    return this.automationsService.createAutomation(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAutomationDto) {
    return this.automationsService.updateAutomation(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.automationsService.removeAutomation(id);
  }
}
