import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { ProceduresService } from './procedures.service';

@Controller({ path: 'procedures', version: '1' })
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.proceduresService.findAllProcedures();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proceduresService.findProcedureById(id);
  }

  @Post()
  create(@Body() body: CreateProcedureDto) {
    return this.proceduresService.createProcedure(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProcedureDto) {
    return this.proceduresService.updateProcedure(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proceduresService.removeProcedure(id);
  }
}
