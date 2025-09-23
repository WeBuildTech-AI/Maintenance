import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { AttachmentsService } from './attachments.service';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    findAll(): import("./attachments.service").AttachmentEntity[];
    findOne(id: string): import("./attachments.service").AttachmentEntity;
    create(body: CreateAttachmentDto): import("./attachments.service").AttachmentEntity;
}
