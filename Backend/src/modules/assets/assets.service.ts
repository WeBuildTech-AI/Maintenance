import { Injectable } from '@nestjs/common';
import { Asset } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  createAsset(payload: CreateAssetDto): Promise<Asset> {
    return this.prisma.asset.create({ data: payload });
  }

  updateAsset(id: string, payload: UpdateAssetDto): Promise<Asset> {
    return this.prisma.asset.update({ where: { id }, data: payload });
  }

  removeAsset(id: string): Promise<Asset> {
    return this.prisma.asset.delete({ where: { id } });
  }

  findAllAssets(): Promise<Asset[]> {
    return this.prisma.asset.findMany();
  }

  findAssetById(id: string): Promise<Asset> {
    return this.prisma.asset.findUniqueOrThrow({ where: { id } });
  }
}
