import { Injectable } from '@nestjs/common';
import { Vendor } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  createVendor(payload: CreateVendorDto): Promise<Vendor> {
    return this.prisma.vendor.create({ data: payload });
  }

  updateVendor(id: string, payload: UpdateVendorDto): Promise<Vendor> {
    return this.prisma.vendor.update({ where: { id }, data: payload });
  }

  removeVendor(id: string): Promise<Vendor> {
    return this.prisma.vendor.delete({ where: { id } });
  }

  findAllVendors(): Promise<Vendor[]> {
    return this.prisma.vendor.findMany();
  }

  findVendorById(id: string): Promise<Vendor> {
    return this.prisma.vendor.findUniqueOrThrow({ where: { id } });
  }
}
