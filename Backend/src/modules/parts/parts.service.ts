import { Injectable } from '@nestjs/common';
import { Part } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartsService {
  constructor(private readonly prisma: PrismaService) {}

  createPart(payload: CreatePartDto): Promise<Part> {
    return this.prisma.part.create({ data: payload });
  }

  updatePart(id: string, payload: UpdatePartDto): Promise<Part> {
    return this.prisma.part.update({ where: { id }, data: payload });
  }

  removePart(id: string): Promise<Part> {
    return this.prisma.part.delete({ where: { id } });
  }

  findAllParts(): Promise<Part[]> {
    return this.prisma.part.findMany();
  }

  findPartById(id: string): Promise<Part> {
    return this.prisma.part.findUniqueOrThrow({ where: { id } });
  }
}
