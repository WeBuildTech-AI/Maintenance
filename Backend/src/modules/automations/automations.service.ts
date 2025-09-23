import { Injectable } from '@nestjs/common';
import { Automation } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';

@Injectable()
export class AutomationsService {
  constructor(private readonly prisma: PrismaService) {}

  createAutomation(payload: CreateAutomationDto): Promise<Automation> {
    return this.prisma.automation.create({ data: payload });
  }

  updateAutomation(id: string, payload: UpdateAutomationDto): Promise<Automation> {
    return this.prisma.automation.update({ where: { id }, data: payload });
  }

  findAllAutomations(): Promise<Automation[]> {
    return this.prisma.automation.findMany();
  }

  findAutomationById(id: string): Promise<Automation> {
    return this.prisma.automation.findUniqueOrThrow({ where: { id } });
  }

  removeAutomation(id: string): Promise<Automation> {
    return this.prisma.automation.delete({ where: { id } });
  }
}
