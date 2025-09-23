import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { MetersService } from './meters.service';
export declare class MetersController {
    private readonly metersService;
    constructor(metersService: MetersService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        locationId: string | null;
        photos: string[];
        meterType: import(".prisma/client").$Enums.MeterType | null;
        unit: string | null;
        assetId: string | null;
        readingFrequency: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        locationId: string | null;
        photos: string[];
        meterType: import(".prisma/client").$Enums.MeterType | null;
        unit: string | null;
        assetId: string | null;
        readingFrequency: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    create(body: CreateMeterDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        locationId: string | null;
        photos: string[];
        meterType: import(".prisma/client").$Enums.MeterType | null;
        unit: string | null;
        assetId: string | null;
        readingFrequency: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, body: UpdateMeterDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        locationId: string | null;
        photos: string[];
        meterType: import(".prisma/client").$Enums.MeterType | null;
        unit: string | null;
        assetId: string | null;
        readingFrequency: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
