import { Attachment } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
export declare class AttachmentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createAttachment(payload: CreateAttachmentDto): Promise<Attachment>;
    findAllAttachments(): Promise<Attachment[]>;
    findAttachmentById(id: string): Promise<Attachment>;
}
