import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { ProceduresService } from './procedures.service';
export declare class ProceduresController {
    private readonly proceduresService;
    constructor(proceduresService: ProceduresService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        description: string | null;
        type: import(".prisma/client").$Enums.ProcedureType | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        files: string[];
        assetIds: string[];
        frequency: import(".prisma/client").$Enums.ProcedureFrequency | null;
    }[]>;
    findOne(id: string): Promise<{
        description: string | null;
        type: import(".prisma/client").$Enums.ProcedureType | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        files: string[];
        assetIds: string[];
        frequency: import(".prisma/client").$Enums.ProcedureFrequency | null;
    }>;
    create(body: CreateProcedureDto): Promise<{
        description: string | null;
        type: import(".prisma/client").$Enums.ProcedureType | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        files: string[];
        assetIds: string[];
        frequency: import(".prisma/client").$Enums.ProcedureFrequency | null;
    }>;
    update(id: string, body: UpdateProcedureDto): Promise<{
        description: string | null;
        type: import(".prisma/client").$Enums.ProcedureType | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        files: string[];
        assetIds: string[];
        frequency: import(".prisma/client").$Enums.ProcedureFrequency | null;
    }>;
    remove(id: string): Promise<{
        description: string | null;
        type: import(".prisma/client").$Enums.ProcedureType | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        files: string[];
        assetIds: string[];
        frequency: import(".prisma/client").$Enums.ProcedureFrequency | null;
    }>;
}
