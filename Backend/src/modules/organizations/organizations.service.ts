import { Injectable } from '@nestjs/common';
import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateOrganizationDto, IndustryType } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

export interface OrganizationDetails {
  name: string;
  industry?: IndustryType;
  size?: number;
}

export type OrganizationEntity = StoredEntity<OrganizationDetails>;

@Injectable()
export class OrganizationsService extends BaseInMemoryService<OrganizationDetails> {
  createOrganization(payload: CreateOrganizationDto): OrganizationEntity {
    return super.create(payload);
  }

  updateOrganization(id: string, payload: UpdateOrganizationDto): OrganizationEntity {
    return super.update(id, payload);
  }

  removeOrganization(id: string): OrganizationEntity {
    return super.remove(id);
  }

  findAllOrganizations(): OrganizationEntity[] {
    return super.findAll();
  }

  findOrganizationById(id: string): OrganizationEntity {
    return super.findOne(id);
  }
}
