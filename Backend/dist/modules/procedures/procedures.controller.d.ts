import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { ProceduresService } from './procedures.service';
export declare class ProceduresController {
    private readonly proceduresService;
    constructor(proceduresService: ProceduresService);
    findAll(_pagination: PaginationQueryDto): import("./procedures.service").ProcedureEntity[];
    findOne(id: string): import("./procedures.service").ProcedureEntity;
    create(body: CreateProcedureDto): import("./procedures.service").ProcedureEntity;
    update(id: string, body: UpdateProcedureDto): import("./procedures.service").ProcedureEntity;
    remove(id: string): import("./procedures.service").ProcedureEntity;
}
