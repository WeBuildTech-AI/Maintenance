import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateOrganizationDto, IndustryType } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
export interface OrganizationDetails {
    name: string;
    industry?: IndustryType;
    size?: number;
}
export type OrganizationEntity = StoredEntity<OrganizationDetails>;
export declare class OrganizationsService extends BaseInMemoryService<OrganizationDetails> {
    createOrganization(payload: CreateOrganizationDto): OrganizationEntity;
    updateOrganization(id: string, payload: UpdateOrganizationDto): OrganizationEntity;
    removeOrganization(id: string): OrganizationEntity;
    findAllOrganizations(): OrganizationEntity[];
    findOrganizationById(id: string): OrganizationEntity;
}
