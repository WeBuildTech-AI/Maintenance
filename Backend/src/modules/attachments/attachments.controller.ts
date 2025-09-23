import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { AttachmentsService } from './attachments.service';

@Controller({ path: 'attachments', version: '1' })
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get()
  findAll() {
    return this.attachmentsService.findAllAttachments();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attachmentsService.findAttachmentById(id);
  }

  @Post()
  create(@Body() body: CreateAttachmentDto) {
    return this.attachmentsService.createAttachment(body);
  }
}
