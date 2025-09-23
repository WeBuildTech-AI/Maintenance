export declare class CreateVendorDto {
    organizationId: string;
    name: string;
    pictureUrl?: string;
    color?: string;
    description?: string;
    contacts?: Record<string, any>;
    files?: string[];
    vendorType?: string;
}
