import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';

@Controller({ path: 'locations', version: '1' })
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.locationsService.findAllLocations();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationsService.findLocationById(id);
  }

  @Post()
  create(@Body() body: CreateLocationDto) {
    return this.locationsService.createLocation(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateLocationDto) {
    return this.locationsService.updateLocation(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationsService.removeLocation(id);
  }
}
