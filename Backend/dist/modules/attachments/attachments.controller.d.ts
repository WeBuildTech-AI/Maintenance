import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { AttachmentsService } from './attachments.service';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    findAll(): Promise<{
        category: string | null;
        id: string;
        organizationId: string | null;
        createdAt: Date;
        fileName: string;
        fileUrl: string;
        uploadedBy: string | null;
    }[]>;
    findOne(id: string): Promise<{
        category: string | null;
        id: string;
        organizationId: string | null;
        createdAt: Date;
        fileName: string;
        fileUrl: string;
        uploadedBy: string | null;
    }>;
    create(body: CreateAttachmentDto): Promise<{
        category: string | null;
        id: string;
        organizationId: string | null;
        createdAt: Date;
        fileName: string;
        fileUrl: string;
        uploadedBy: string | null;
    }>;
}
