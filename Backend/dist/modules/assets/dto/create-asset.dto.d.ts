export declare enum AssetCriticality {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare class CreateAssetDto {
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
