import { Organization } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
export declare class OrganizationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createOrganization(payload: CreateOrganizationDto): Promise<Organization>;
    updateOrganization(id: string, payload: UpdateOrganizationDto): Promise<Organization>;
    removeOrganization(id: string): Promise<Organization>;
    findAllOrganizations(): Promise<Organization[]>;
    findOrganizationById(id: string): Promise<Organization>;
}
