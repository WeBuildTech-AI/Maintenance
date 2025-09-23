import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { ProceduresService } from './procedures.service';
export declare class ProceduresController {
    private readonly proceduresService;
    constructor(proceduresService: ProceduresService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        files: string[];
        title: string;
        assetIds: string[];
        type: import(".prisma/client").$Enums.ProcedureType | null;
        frequency: import(".prisma/client").$Enums.ProcedureFrequency | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        files: string[];
        title: string;
        assetIds: string[];
        type: import(".prisma/client").$Enums.ProcedureType | null;
        frequency: import(".prisma/client").$Enums.ProcedureFrequency | null;
    }>;
    create(body: CreateProcedureDto): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        files: string[];
        title: string;
        assetIds: string[];
        type: import(".prisma/client").$Enums.ProcedureType | null;
        frequency: import(".prisma/client").$Enums.ProcedureFrequency | null;
    }>;
    update(id: string, body: UpdateProcedureDto): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        files: string[];
        title: string;
        assetIds: string[];
        type: import(".prisma/client").$Enums.ProcedureType | null;
        frequency: import(".prisma/client").$Enums.ProcedureFrequency | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        files: string[];
        title: string;
        assetIds: string[];
        type: import(".prisma/client").$Enums.ProcedureType | null;
        frequency: import(".prisma/client").$Enums.ProcedureFrequency | null;
    }>;
}
