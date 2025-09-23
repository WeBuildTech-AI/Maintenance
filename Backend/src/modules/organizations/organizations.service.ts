import { Injectable } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  createOrganization(payload: CreateOrganizationDto): Promise<Organization> {
    return this.prisma.organization.create({ data: payload });
  }

  updateOrganization(id: string, payload: UpdateOrganizationDto): Promise<Organization> {
    return this.prisma.organization.update({ where: { id }, data: payload });
  }

  removeOrganization(id: string): Promise<Organization> {
    return this.prisma.organization.delete({ where: { id } });
  }

  findAllOrganizations(): Promise<Organization[]> {
    return this.prisma.organization.findMany();
  }

  findOrganizationById(id: string): Promise<Organization> {
    return this.prisma.organization.findUniqueOrThrow({ where: { id } });
  }
}
