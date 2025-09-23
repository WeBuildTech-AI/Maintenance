import { Injectable } from '@nestjs/common';
import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

export interface LocationDetails {
  organizationId: string;
  name: string;
  photoUrls?: string[];
  address?: string;
  description?: string;
  teamsInCharge?: string[];
  files?: string[];
  vendorIds?: string[];
  parentLocationId?: string;
}

export type LocationEntity = StoredEntity<LocationDetails>;

@Injectable()
export class LocationsService extends BaseInMemoryService<LocationDetails> {
  createLocation(payload: CreateLocationDto): LocationEntity {
    return super.create(payload);
  }

  updateLocation(id: string, payload: UpdateLocationDto): LocationEntity {
    return super.update(id, payload);
  }

  findAllLocations(): LocationEntity[] {
    return super.findAll();
  }

  findLocationById(id: string): LocationEntity {
    return super.findOne(id);
  }

  removeLocation(id: string): LocationEntity {
    return super.remove(id);
  }
}
