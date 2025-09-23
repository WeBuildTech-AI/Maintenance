import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
export interface AttachmentDetails {
    fileName: string;
    url: string;
    uploadedBy?: string;
    category?: string;
}
export type AttachmentEntity = StoredEntity<AttachmentDetails>;
export declare class AttachmentsService extends BaseInMemoryService<AttachmentDetails> {
    createAttachment(payload: CreateAttachmentDto): AttachmentEntity;
    findAllAttachments(): AttachmentEntity[];
    findAttachmentById(id: string): AttachmentEntity;
}
