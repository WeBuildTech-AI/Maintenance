import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
export declare class AutomationsController {
    private readonly automationsService;
    constructor(automationsService: AutomationsService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        isEnabled: boolean;
        triggers: import("@prisma/client/runtime/library").JsonValue | null;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        actions: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findOne(id: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        isEnabled: boolean;
        triggers: import("@prisma/client/runtime/library").JsonValue | null;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        actions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    create(body: CreateAutomationDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        isEnabled: boolean;
        triggers: import("@prisma/client/runtime/library").JsonValue | null;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        actions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, body: UpdateAutomationDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        isEnabled: boolean;
        triggers: import("@prisma/client/runtime/library").JsonValue | null;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        actions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string;
        isEnabled: boolean;
        triggers: import("@prisma/client/runtime/library").JsonValue | null;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        actions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
