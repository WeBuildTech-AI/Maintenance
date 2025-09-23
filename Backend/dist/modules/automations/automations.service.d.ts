import { Automation } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
export declare class AutomationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createAutomation(payload: CreateAutomationDto): Promise<Automation>;
    updateAutomation(id: string, payload: UpdateAutomationDto): Promise<Automation>;
    findAllAutomations(): Promise<Automation[]>;
    findAutomationById(id: string): Promise<Automation>;
    removeAutomation(id: string): Promise<Automation>;
}
