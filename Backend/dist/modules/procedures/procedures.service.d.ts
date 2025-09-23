import { Procedure } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
export declare class ProceduresService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createProcedure(payload: CreateProcedureDto): Promise<Procedure>;
    updateProcedure(id: string, payload: UpdateProcedureDto): Promise<Procedure>;
    findAllProcedures(): Promise<Procedure[]>;
    findProcedureById(id: string): Promise<Procedure>;
    removeProcedure(id: string): Promise<Procedure>;
}
