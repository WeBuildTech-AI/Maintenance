import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
export declare class AutomationsController {
    private readonly automationsService;
    constructor(automationsService: AutomationsService);
    findAll(_pagination: PaginationQueryDto): import("./automations.service").AutomationEntity[];
    findOne(id: string): import("./automations.service").AutomationEntity;
    create(body: CreateAutomationDto): import("./automations.service").AutomationEntity;
    update(id: string, body: UpdateAutomationDto): import("./automations.service").AutomationEntity;
    remove(id: string): import("./automations.service").AutomationEntity;
}
