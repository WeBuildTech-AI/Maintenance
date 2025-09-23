import { Injectable } from '@nestjs/common';
import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import {
  CreateProcedureDto,
  ProcedureFrequency,
  ProcedureType,
} from './dto/create-procedure.dto';
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

@Injectable()
export class ProceduresService extends BaseInMemoryService<ProcedureDetails> {
  createProcedure(payload: CreateProcedureDto): ProcedureEntity {
    return super.create(payload);
  }

  updateProcedure(id: string, payload: UpdateProcedureDto): ProcedureEntity {
    return super.update(id, payload);
  }

  findAllProcedures(): ProcedureEntity[] {
    return super.findAll();
  }

  findProcedureById(id: string): ProcedureEntity {
    return super.findOne(id);
  }

  removeProcedure(id: string): ProcedureEntity {
    return super.remove(id);
  }
}
