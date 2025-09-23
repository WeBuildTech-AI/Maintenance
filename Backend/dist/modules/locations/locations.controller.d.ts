import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    findAll(_pagination: PaginationQueryDto): import("./locations.service").LocationEntity[];
    findOne(id: string): import("./locations.service").LocationEntity;
    create(body: CreateLocationDto): import("./locations.service").LocationEntity;
    update(id: string, body: UpdateLocationDto): import("./locations.service").LocationEntity;
    remove(id: string): import("./locations.service").LocationEntity;
}
