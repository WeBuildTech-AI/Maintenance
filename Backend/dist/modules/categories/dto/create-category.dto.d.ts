export declare enum CategoryIcon {
    WRENCH = "wrench",
    BOLT = "bolt",
    GEAR = "gear",
    ELECTRIC = "electric",
    PLUMBING = "plumbing",
    HVAC = "hvac"
}
export declare class CreateCategoryDto {
    organizationId: string;
    name: string;
    categoryIcon?: CategoryIcon;
    description?: string;
}
