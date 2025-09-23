import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
export interface AutomationDetails {
    organizationId: string;
    name: string;
    description?: string;
    isEnabled?: boolean;
    triggers?: Record<string, any>;
    conditions?: Record<string, any>;
    actions?: Record<string, any>;
}
export type AutomationEntity = StoredEntity<AutomationDetails>;
export declare class AutomationsService extends BaseInMemoryService<AutomationDetails> {
    createAutomation(payload: CreateAutomationDto): AutomationEntity;
    updateAutomation(id: string, payload: UpdateAutomationDto): AutomationEntity;
    findAllAutomations(): AutomationEntity[];
    findAutomationById(id: string): AutomationEntity;
    removeAutomation(id: string): AutomationEntity;
}
