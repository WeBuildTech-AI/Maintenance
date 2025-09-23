import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';
export declare class OrganizationsController {
    private readonly organizationsService;
    constructor(organizationsService: OrganizationsService);
    findAll(_pagination: PaginationQueryDto): import("./organizations.service").OrganizationEntity[];
    findOne(id: string): import("./organizations.service").OrganizationEntity;
    create(body: CreateOrganizationDto): import("./organizations.service").OrganizationEntity;
    update(id: string, body: UpdateOrganizationDto): import("./organizations.service").OrganizationEntity;
    remove(id: string): import("./organizations.service").OrganizationEntity;
}
