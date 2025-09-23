export declare enum IndustryType {
    MANUFACTURING = "manufacturing",
    REAL_ESTATE = "real_estate",
    HEALTHCARE = "healthcare",
    HOSPITALITY = "hospitality",
    EDUCATION = "education",
    OTHER = "other"
}
export declare class CreateOrganizationDto {
    name: string;
    industry?: IndustryType;
    size?: number;
}
