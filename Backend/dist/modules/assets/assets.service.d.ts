import { Asset } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createAsset(payload: CreateAssetDto): Promise<Asset>;
    updateAsset(id: string, payload: UpdateAssetDto): Promise<Asset>;
    removeAsset(id: string): Promise<Asset>;
    findAllAssets(): Promise<Asset[]>;
    findAssetById(id: string): Promise<Asset>;
}
