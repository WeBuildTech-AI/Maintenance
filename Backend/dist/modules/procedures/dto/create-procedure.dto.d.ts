export declare enum ProcedureType {
    MAINTENANCE = "maintenance",
    INSPECTION = "inspection",
    SAFETY_CHECK = "safety_check"
}
export declare enum ProcedureFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    YEARLY = "yearly"
}
export declare class CreateProcedureDto {
    organizationId: string;
    title: string;
    assetIds?: string[];
    type?: ProcedureType;
    frequency?: ProcedureFrequency;
    description?: string;
    files?: string[];
}
