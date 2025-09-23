import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        files: string[];
        teamsInCharge: string[];
        vendorIds: string[];
        photoUrls: string[];
        address: string | null;
        parentLocationId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        files: string[];
        teamsInCharge: string[];
        vendorIds: string[];
        photoUrls: string[];
        address: string | null;
        parentLocationId: string | null;
    }>;
    create(body: CreateLocationDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        files: string[];
        teamsInCharge: string[];
        vendorIds: string[];
        photoUrls: string[];
        address: string | null;
        parentLocationId: string | null;
    }>;
    update(id: string, body: UpdateLocationDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        files: string[];
        teamsInCharge: string[];
        vendorIds: string[];
        photoUrls: string[];
        address: string | null;
        parentLocationId: string | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        files: string[];
        teamsInCharge: string[];
        vendorIds: string[];
        photoUrls: string[];
        address: string | null;
        parentLocationId: string | null;
    }>;
}
