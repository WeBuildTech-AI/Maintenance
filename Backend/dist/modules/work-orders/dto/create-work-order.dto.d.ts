export declare enum WorkOrderPriority {
    URGENT = "urgent",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare class CreateWorkOrderDto {
    organizationId: string;
    title: string;
    status?: string;
    pictures?: string[];
    description?: string;
    locationId?: string;
    assetIds?: string[];
    procedureIds?: string[];
    assigneeIds?: string[];
    estimatedTimeHours?: number;
    dueDate?: string;
    startDate?: string;
    recurrenceRule?: string;
    workType?: string;
    priority?: WorkOrderPriority;
    files?: string[];
    partIds?: string[];
    categoryIds?: string[];
    vendorIds?: string[];
}
