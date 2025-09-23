import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        files: string[];
        teamsInCharge: string[];
        vendorIds: string[];
        photoUrls: string[];
        address: string | null;
        parentLocationId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        files: string[];
        teamsInCharge: string[];
        vendorIds: string[];
        photoUrls: string[];
        address: string | null;
        parentLocationId: string | null;
    }>;
    create(body: CreateLocationDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        files: string[];
        teamsInCharge: string[];
        vendorIds: string[];
        photoUrls: string[];
        address: string | null;
        parentLocationId: string | null;
    }>;
    update(id: string, body: UpdateLocationDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        files: string[];
        teamsInCharge: string[];
        vendorIds: string[];
        photoUrls: string[];
        address: string | null;
        parentLocationId: string | null;
    }>;
    remove(id: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        files: string[];
        teamsInCharge: string[];
        vendorIds: string[];
        photoUrls: string[];
        address: string | null;
        parentLocationId: string | null;
    }>;
}
