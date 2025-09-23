import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartsService } from './parts.service';
export declare class PartsController {
    private readonly partsService;
    constructor(partsService: PartsService);
    findAll(_pagination: PaginationQueryDto): import("./parts.service").PartEntity[];
    findOne(id: string): import("./parts.service").PartEntity;
    create(body: CreatePartDto): import("./parts.service").PartEntity;
    update(id: string, body: UpdatePartDto): import("./parts.service").PartEntity;
    remove(id: string): import("./parts.service").PartEntity;
}
