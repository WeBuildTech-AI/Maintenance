import { Injectable } from '@nestjs/common';
import { Attachment } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  createAttachment(payload: CreateAttachmentDto): Promise<Attachment> {
    return this.prisma.attachment.create({
      data: {
        fileName: payload.fileName,
        fileUrl: payload.url,
        uploadedBy: payload.uploadedBy,
        category: payload.category,
      },
    });
  }

  findAllAttachments(): Promise<Attachment[]> {
    return this.prisma.attachment.findMany();
  }

  findAttachmentById(id: string): Promise<Attachment> {
    return this.prisma.attachment.findUniqueOrThrow({ where: { id } });
  }
}
