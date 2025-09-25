import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Vendor } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { CreateVendorDto } from "./dto/create-vendor.dto";
import { UpdateVendorDto } from "./dto/update-vendor.dto";

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async createVendor(payload: CreateVendorDto): Promise<Vendor> {
    // Validate locations exist if provided
    if (payload.locations && payload.locations.length > 0) {
      const existingLocations = await this.prisma.location.findMany({
        where: { id: { in: payload.locations } },
      });
      if (existingLocations.length !== payload.locations.length) {
        const foundLocationIds = existingLocations.map((loc) => loc.id);
        const missingLocations = payload.locations.filter(
          (id) => !foundLocationIds.includes(id)
        );
        throw new BadRequestException(
          `Locations not found: ${missingLocations.join(", ")}`
        );
      }
    }

    // Validate assets exist if provided
    if (payload.assetIds && payload.assetIds.length > 0) {
      const existingAssets = await this.prisma.asset.findMany({
        where: { id: { in: payload.assetIds } },
      });
      if (existingAssets.length !== payload.assetIds.length) {
        const foundAssetIds = existingAssets.map((asset) => asset.id);
        const missingAssets = payload.assetIds.filter(
          (id) => !foundAssetIds.includes(id)
        );
        throw new BadRequestException(
          `Assets not found: ${missingAssets.join(", ")}`
        );
      }
    }

    // Validate parts exist if provided
    if (payload.partIds && payload.partIds.length > 0) {
      const existingParts = await this.prisma.part.findMany({
        where: { id: { in: payload.partIds } },
      });
      if (existingParts.length !== payload.partIds.length) {
        const foundPartIds = existingParts.map((part) => part.id);
        const missingParts = payload.partIds.filter(
          (id) => !foundPartIds.includes(id)
        );
        throw new BadRequestException(
          `Parts not found: ${missingParts.join(", ")}`
        );
      }
    }

    return this.prisma.vendor.create({ data: payload });
  }

  async updateVendor(id: string, payload: UpdateVendorDto): Promise<Vendor> {
    // Check if vendor exists
    const existingVendor = await this.prisma.vendor.findUnique({
      where: { id },
    });
    if (!existingVendor) {
      throw new NotFoundException(`Vendor with id '${id}' not found`);
    }

    // Validate relations if provided
    if (payload.locations && payload.locations.length > 0) {
      const existingLocations = await this.prisma.location.findMany({
        where: { id: { in: payload.locations } },
      });
      if (existingLocations.length !== payload.locations.length) {
        const foundLocationIds = existingLocations.map((loc) => loc.id);
        const missingLocations = payload.locations.filter(
          (id) => !foundLocationIds.includes(id)
        );
        throw new BadRequestException(
          `Locations not found: ${missingLocations.join(", ")}`
        );
      }
    }

    if (payload.assetIds && payload.assetIds.length > 0) {
      const existingAssets = await this.prisma.asset.findMany({
        where: { id: { in: payload.assetIds } },
      });
      if (existingAssets.length !== payload.assetIds.length) {
        const foundAssetIds = existingAssets.map((asset) => asset.id);
        const missingAssets = payload.assetIds.filter(
          (id) => !foundAssetIds.includes(id)
        );
        throw new BadRequestException(
          `Assets not found: ${missingAssets.join(", ")}`
        );
      }
    }

    if (payload.partIds && payload.partIds.length > 0) {
      const existingParts = await this.prisma.part.findMany({
        where: { id: { in: payload.partIds } },
      });
      if (existingParts.length !== payload.partIds.length) {
        const foundPartIds = existingParts.map((part) => part.id);
        const missingParts = payload.partIds.filter(
          (id) => !foundPartIds.includes(id)
        );
        throw new BadRequestException(
          `Parts not found: ${missingParts.join(", ")}`
        );
      }
    }

    return this.prisma.vendor.update({ where: { id }, data: payload });
  }

  async removeVendor(id: string): Promise<Vendor> {
    const existingVendor = await this.prisma.vendor.findUnique({
      where: { id },
    });
    if (!existingVendor) {
      throw new NotFoundException(`Vendor with id '${id}' not found`);
    }

    return this.prisma.vendor.delete({ where: { id } });
  }

  async findAllVendors(): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findVendorById(id: string): Promise<Vendor> {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with id '${id}' not found`);
    }
    return vendor;
  }

  async findVendorsByType(vendorType: string): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      where: { vendorType: vendorType as any },
      orderBy: { createdAt: "desc" },
    });
  }

  async findVendorsByLocation(locationId: string): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      where: {
        locations: {
          has: locationId,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findVendorsByAsset(assetId: string): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      where: {
        assetIds: {
          has: assetId,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findVendorsByPart(partId: string): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      where: {
        partIds: {
          has: partId,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
