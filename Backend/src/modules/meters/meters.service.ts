import { Injectable } from '@nestjs/common';
import { Meter } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';

@Injectable()
export class MetersService {
  constructor(private readonly prisma: PrismaService) {}

  createMeter(payload: CreateMeterDto): Promise<Meter> {
    return this.prisma.meter.create({ data: payload });
  }

  updateMeter(id: string, payload: UpdateMeterDto): Promise<Meter> {
    return this.prisma.meter.update({ where: { id }, data: payload });
  }

  findAllMeters(): Promise<Meter[]> {
    return this.prisma.meter.findMany();
  }

  findMeterById(id: string): Promise<Meter> {
    return this.prisma.meter.findUniqueOrThrow({ where: { id } });
  }
}
