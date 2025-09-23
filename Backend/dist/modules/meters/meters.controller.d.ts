import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { MetersService } from './meters.service';
export declare class MetersController {
    private readonly metersService;
    constructor(metersService: MetersService);
    findAll(_pagination: PaginationQueryDto): import("./meters.service").MeterEntity[];
    findOne(id: string): import("./meters.service").MeterEntity;
    create(body: CreateMeterDto): import("./meters.service").MeterEntity;
    update(id: string, body: UpdateMeterDto): import("./meters.service").MeterEntity;
}
