export declare class CreateAutomationDto {
    organizationId: string;
    name: string;
    description?: string;
    isEnabled?: boolean;
    triggers?: Record<string, any>;
    conditions?: Record<string, any>;
    actions?: Record<string, any>;
}
