import axios from "axios";

import type {
  AttachmentResponse,
  CreateAttachmentData,
  UpdateAttachmentData,
} from "./attachments.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const attachmentService = {
  fetchAttachments: async (): Promise<AttachmentResponse[]> => {
    const res = await axios.get(`${API_URL}/attachments`);
    return res.data;
  },

  fetchAttachmentById: async (id: string): Promise<AttachmentResponse> => {
    const res = await axios.get(`${API_URL}/attachments/${id}`);
    return res.data;
  },

  createAttachment: async (
    data: CreateAttachmentData
  ): Promise<AttachmentResponse> => {
    const res = await axios.post(`${API_URL}/attachments`, data);
    return res.data;
  },

  updateAttachment: async (
    id: string,
    data: UpdateAttachmentData
  ): Promise<AttachmentResponse> => {
    const res = await axios.patch(`${API_URL}/attachments/${id}`, data);
    return res.data;
  },

  deleteAttachment: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/attachments/${id}`);
  },

  uploadFile: async (
    file: File,
    organizationId: string,
    uploadedByUserId: string
  ): Promise<AttachmentResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("organizationId", organizationId);
    formData.append("uploadedBy", uploadedByUserId);

    const res = await axios.post(`${API_URL}/attachments/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log("Upload Progress:", percent, "%");
        }
      },
    });

    return res.data;
  },

  downloadAttachment: async (id: string): Promise<Blob> => {
    const res = await axios.get(`${API_URL}/attachments/${id}/download`, {
      responseType: "blob",
    });
    return res.data;
  },
};
