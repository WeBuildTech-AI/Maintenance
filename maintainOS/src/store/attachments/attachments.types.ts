export interface AttachmentResponse {
  id: string;
  organizationId: string;
  fileName: string;
  url: string;
  uploadedBy?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttachmentData {
  organizationId: string;
  fileName: string;
  url: string;
  uploadedBy?: string;
  category?: string;
}

export interface UpdateAttachmentData {
  fileName?: string;
  category?: string;
}

export interface AttachmentsState {
  attachments: AttachmentResponse[];
  selectedAttachment: AttachmentResponse | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;
}
