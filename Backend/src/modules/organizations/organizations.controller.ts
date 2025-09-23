import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';

@Controller({ path: 'organizations', version: '1' })
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.organizationsService.findAllOrganizations();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOrganizationById(id);
  }

  @Post()
  create(@Body() body: CreateOrganizationDto) {
    return this.organizationsService.createOrganization(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateOrganizationDto) {
    return this.organizationsService.updateOrganization(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationsService.removeOrganization(id);
  }
}
