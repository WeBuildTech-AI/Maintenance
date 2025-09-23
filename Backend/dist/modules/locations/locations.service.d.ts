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
export declare class LocationsService extends BaseInMemoryService<LocationDetails> {
    createLocation(payload: CreateLocationDto): LocationEntity;
    updateLocation(id: string, payload: UpdateLocationDto): LocationEntity;
    findAllLocations(): LocationEntity[];
    findLocationById(id: string): LocationEntity;
    removeLocation(id: string): LocationEntity;
}
