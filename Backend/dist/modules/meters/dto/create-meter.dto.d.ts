export declare enum MeterType {
    ELECTRICITY = "electricity",
    WATER = "water",
    GAS = "gas",
    RUNTIME = "runtime"
}
export declare class CreateMeterDto {
    organizationId: string;
    name: string;
    meterType?: MeterType;
    description?: string;
    unit?: string;
    assetId?: string;
    locationId?: string;
    readingFrequency?: Record<string, any>;
    photos?: string[];
}
