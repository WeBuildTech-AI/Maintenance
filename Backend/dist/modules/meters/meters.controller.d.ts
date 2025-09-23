import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { MetersService } from './meters.service';
export declare class MetersController {
    private readonly metersService;
    constructor(metersService: MetersService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        locationId: string | null;
        photos: string[];
        meterType: import(".prisma/client").$Enums.MeterType | null;
        unit: string | null;
        assetId: string | null;
        readingFrequency: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findOne(id: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        locationId: string | null;
        photos: string[];
        meterType: import(".prisma/client").$Enums.MeterType | null;
        unit: string | null;
        assetId: string | null;
        readingFrequency: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    create(body: CreateMeterDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        locationId: string | null;
        photos: string[];
        meterType: import(".prisma/client").$Enums.MeterType | null;
        unit: string | null;
        assetId: string | null;
        readingFrequency: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, body: UpdateMeterDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        locationId: string | null;
        photos: string[];
        meterType: import(".prisma/client").$Enums.MeterType | null;
        unit: string | null;
        assetId: string | null;
        readingFrequency: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
