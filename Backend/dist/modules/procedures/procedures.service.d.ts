import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateProcedureDto, ProcedureFrequency, ProcedureType } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
export interface ProcedureDetails {
    organizationId: string;
    title: string;
    assetIds?: string[];
    type?: ProcedureType;
    frequency?: ProcedureFrequency;
    description?: string;
    files?: string[];
}
export type ProcedureEntity = StoredEntity<ProcedureDetails>;
export declare class ProceduresService extends BaseInMemoryService<ProcedureDetails> {
    createProcedure(payload: CreateProcedureDto): ProcedureEntity;
    updateProcedure(id: string, payload: UpdateProcedureDto): ProcedureEntity;
    findAllProcedures(): ProcedureEntity[];
    findProcedureById(id: string): ProcedureEntity;
    removeProcedure(id: string): ProcedureEntity;
}
