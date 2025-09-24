import api from "./api";
import type { Attachment } from "@prisma/client";

// Re-export Prisma types for convenience
export type { Attachment } from "@prisma/client";

// For API responses
export type AttachmentResponse = Attachment;

// For creating new attachments
export interface CreateAttachmentData {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  organizationId: string;
  uploadedByUserId: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  description?: string;
}

// For updating existing attachments
export interface UpdateAttachmentData {
  filename?: string;
  originalName?: string;
  description?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export const attachmentService = {
  // Fetch all attachments
  fetchAttachments: async (): Promise<AttachmentResponse[]> => {
    const response = await api.get("/attachments");
    return response.data;
  },

  // Fetch attachment by ID
  fetchAttachmentById: async (id: string): Promise<AttachmentResponse> => {
    const response = await api.get(`/attachments/${id}`);
    return response.data;
  },

  // Create a new attachment
  createAttachment: async (
    attachmentData: CreateAttachmentData
  ): Promise<AttachmentResponse> => {
    const response = await api.post("/attachments", attachmentData);
    return response.data;
  },

  // Update attachment
  updateAttachment: async (
    id: string,
    attachmentData: UpdateAttachmentData
  ): Promise<AttachmentResponse> => {
    const response = await api.patch(`/attachments/${id}`, attachmentData);
    return response.data;
  },

  // Delete attachment
  deleteAttachment: async (id: string): Promise<void> => {
    await api.delete(`/attachments/${id}`);
  },

  // Upload file
  uploadFile: async (
    file: File,
    organizationId: string,
    uploadedByUserId: string
  ): Promise<AttachmentResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("organizationId", organizationId);
    formData.append("uploadedByUserId", uploadedByUserId);

    const response = await api.post("/attachments/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Download attachment
  downloadAttachment: async (id: string): Promise<Blob> => {
    const response = await api.get(`/attachments/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },
};
