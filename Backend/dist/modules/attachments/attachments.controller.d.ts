import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { AttachmentsService } from './attachments.service';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string | null;
        category: string | null;
        fileName: string;
        fileUrl: string;
        uploadedBy: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string | null;
        category: string | null;
        fileName: string;
        fileUrl: string;
        uploadedBy: string | null;
    }>;
    create(body: CreateAttachmentDto): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string | null;
        category: string | null;
        fileName: string;
        fileUrl: string;
        uploadedBy: string | null;
    }>;
}
