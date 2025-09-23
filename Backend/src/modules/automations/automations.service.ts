import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AutomationsService extends BaseInMemoryService<AutomationDetails> {
  createAutomation(payload: CreateAutomationDto): AutomationEntity {
    return super.create(payload);
  }

  updateAutomation(id: string, payload: UpdateAutomationDto): AutomationEntity {
    return super.update(id, payload);
  }

  findAllAutomations(): AutomationEntity[] {
    return super.findAll();
  }

  findAutomationById(id: string): AutomationEntity {
    return super.findOne(id);
  }

  removeAutomation(id: string): AutomationEntity {
    return super.remove(id);
  }
}
