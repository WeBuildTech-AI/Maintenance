import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateAssetDto, AssetCriticality } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export interface AssetDetails {
    organizationId: string;
    name: string;
    description?: string;
    pictures?: string[];
    files?: string[];
    locationId?: string;
    criticality?: AssetCriticality;
    year?: number;
    warrantyDate?: string;
    isUnderWarranty?: boolean;
    isUnderAmc?: boolean;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    teamsInCharge?: string[];
    qrCode?: string;
    assetTypeId?: string;
    vendorId?: string;
    partIds?: string[];
    parentAssetId?: string;
}
export type AssetEntity = StoredEntity<AssetDetails>;
export declare class AssetsService extends BaseInMemoryService<AssetDetails> {
    createAsset(payload: CreateAssetDto): AssetEntity;
    updateAsset(id: string, payload: UpdateAssetDto): AssetEntity;
    removeAsset(id: string): AssetEntity;
    findAllAssets(): AssetEntity[];
    findAssetById(id: string): AssetEntity;
}
