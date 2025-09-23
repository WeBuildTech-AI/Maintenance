import { Part } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
export declare class PartsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createPart(payload: CreatePartDto): Promise<Part>;
    updatePart(id: string, payload: UpdatePartDto): Promise<Part>;
    removePart(id: string): Promise<Part>;
    findAllParts(): Promise<Part[]>;
    findPartById(id: string): Promise<Part>;
}
