import { Injectable } from '@nestjs/common';
import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

export interface AttachmentDetails {
  fileName: string;
  url: string;
  uploadedBy?: string;
  category?: string;
}

export type AttachmentEntity = StoredEntity<AttachmentDetails>;

@Injectable()
export class AttachmentsService extends BaseInMemoryService<AttachmentDetails> {
  createAttachment(payload: CreateAttachmentDto): AttachmentEntity {
    return super.create(payload);
  }

  findAllAttachments(): AttachmentEntity[] {
    return super.findAll();
  }

  findAttachmentById(id: string): AttachmentEntity {
    return super.findOne(id);
  }
}
