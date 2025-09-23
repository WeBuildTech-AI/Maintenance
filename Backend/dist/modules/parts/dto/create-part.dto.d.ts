export declare class CreatePartDto {
    organizationId: string;
    name: string;
    photos?: string[];
    unitCost?: number;
    description?: string;
    qrCode?: string;
    partsType?: string[];
    location?: Record<string, any>;
    assetIds?: string[];
    teamsInCharge?: string[];
    vendorIds?: string[];
    files?: string[];
}
