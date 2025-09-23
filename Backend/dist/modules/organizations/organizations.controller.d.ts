import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';
export declare class OrganizationsController {
    private readonly organizationsService;
    constructor(organizationsService: OrganizationsService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        industry: import(".prisma/client").$Enums.IndustryType | null;
        size: number | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        industry: import(".prisma/client").$Enums.IndustryType | null;
        size: number | null;
    }>;
    create(body: CreateOrganizationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        industry: import(".prisma/client").$Enums.IndustryType | null;
        size: number | null;
    }>;
    update(id: string, body: UpdateOrganizationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        industry: import(".prisma/client").$Enums.IndustryType | null;
        size: number | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        industry: import(".prisma/client").$Enums.IndustryType | null;
        size: number | null;
    }>;
}
