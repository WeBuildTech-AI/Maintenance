import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorsService } from './vendors.service';
export declare class VendorsController {
    private readonly vendorsService;
    constructor(vendorsService: VendorsService);
    findAll(_pagination: PaginationQueryDto): import("./vendors.service").VendorEntity[];
    findOne(id: string): import("./vendors.service").VendorEntity;
    create(body: CreateVendorDto): import("./vendors.service").VendorEntity;
    update(id: string, body: UpdateVendorDto): import("./vendors.service").VendorEntity;
}
