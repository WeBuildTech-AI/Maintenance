import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    findAll(_pagination: PaginationQueryDto): import("./assets.service").AssetEntity[];
    findOne(id: string): import("./assets.service").AssetEntity;
    create(body: CreateAssetDto): import("./assets.service").AssetEntity;
    update(id: string, body: UpdateAssetDto): import("./assets.service").AssetEntity;
    remove(id: string): import("./assets.service").AssetEntity;
}
