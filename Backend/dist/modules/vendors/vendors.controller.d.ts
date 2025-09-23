import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorsService } from './vendors.service';
export declare class VendorsController {
    private readonly vendorsService;
    constructor(vendorsService: VendorsService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string | null;
        files: string[];
        pictureUrl: string | null;
        contacts: import("@prisma/client/runtime/library").JsonValue | null;
        vendorType: string | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string | null;
        files: string[];
        pictureUrl: string | null;
        contacts: import("@prisma/client/runtime/library").JsonValue | null;
        vendorType: string | null;
    }>;
    create(body: CreateVendorDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string | null;
        files: string[];
        pictureUrl: string | null;
        contacts: import("@prisma/client/runtime/library").JsonValue | null;
        vendorType: string | null;
    }>;
    update(id: string, body: UpdateVendorDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        color: string | null;
        files: string[];
        pictureUrl: string | null;
        contacts: import("@prisma/client/runtime/library").JsonValue | null;
        vendorType: string | null;
    }>;
}
