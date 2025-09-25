import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { MetersService } from './meters.service';

@Controller({ path: 'meters', version: '1' })
export class MetersController {
  constructor(private readonly metersService: MetersService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.metersService.findAllMeters();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.metersService.findMeterById(id);
  }

  @Post()
  create(@Body() body: CreateMeterDto) {
    return this.metersService.createMeter(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateMeterDto) {
    return this.metersService.updateMeter(id, body);
  }
}
