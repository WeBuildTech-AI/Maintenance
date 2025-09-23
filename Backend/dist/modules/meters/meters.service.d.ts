import { Meter } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
export declare class MetersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createMeter(payload: CreateMeterDto): Promise<Meter>;
    updateMeter(id: string, payload: UpdateMeterDto): Promise<Meter>;
    findAllMeters(): Promise<Meter[]>;
    findMeterById(id: string): Promise<Meter>;
}
