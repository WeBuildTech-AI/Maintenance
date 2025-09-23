import { Vendor } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
export declare class VendorsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createVendor(payload: CreateVendorDto): Promise<Vendor>;
    updateVendor(id: string, payload: UpdateVendorDto): Promise<Vendor>;
    removeVendor(id: string): Promise<Vendor>;
    findAllVendors(): Promise<Vendor[]>;
    findVendorById(id: string): Promise<Vendor>;
}
