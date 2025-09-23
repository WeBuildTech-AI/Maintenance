import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartsService } from './parts.service';

@Controller({ path: 'parts', version: '1' })
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.partsService.findAllParts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partsService.findPartById(id);
  }

  @Post()
  create(@Body() body: CreatePartDto) {
    return this.partsService.createPart(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdatePartDto) {
    return this.partsService.updatePart(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partsService.removePart(id);
  }
}
