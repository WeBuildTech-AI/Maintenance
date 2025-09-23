import { Injectable } from '@nestjs/common';
import { Procedure } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';

@Injectable()
export class ProceduresService {
  constructor(private readonly prisma: PrismaService) {}

  createProcedure(payload: CreateProcedureDto): Promise<Procedure> {
    return this.prisma.procedure.create({ data: payload });
  }

  updateProcedure(id: string, payload: UpdateProcedureDto): Promise<Procedure> {
    return this.prisma.procedure.update({ where: { id }, data: payload });
  }

  findAllProcedures(): Promise<Procedure[]> {
    return this.prisma.procedure.findMany();
  }

  findProcedureById(id: string): Promise<Procedure> {
    return this.prisma.procedure.findUniqueOrThrow({ where: { id } });
  }

  removeProcedure(id: string): Promise<Procedure> {
    return this.prisma.procedure.delete({ where: { id } });
  }
}
