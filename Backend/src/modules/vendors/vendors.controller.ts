import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorsService } from './vendors.service';

@Controller({ path: 'vendors', version: '1' })
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.vendorsService.findAllVendors();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorsService.findVendorById(id);
  }

  @Post()
  create(@Body() body: CreateVendorDto) {
    return this.vendorsService.createVendor(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateVendorDto) {
    return this.vendorsService.updateVendor(id, body);
  }
}
