import { createAsyncThunk } from "@reduxjs/toolkit";

import { attachmentService } from "./attachments.service";
import type {
  AttachmentResponse,
  CreateAttachmentData,
  UpdateAttachmentData,
} from "./attachments.types";

export const fetchAttachments = createAsyncThunk(
  "attachments/fetchAttachments",
  async (_, { rejectWithValue }) => {
    try {
      return await attachmentService.fetchAttachments();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attachments"
      );
    }
  }
);

export const fetchAttachmentById = createAsyncThunk(
  "attachments/fetchAttachmentById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await attachmentService.fetchAttachmentById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attachment"
      );
    }
  }
);

export const createAttachment = createAsyncThunk(
  "attachments/createAttachment",
  async (attachmentData: CreateAttachmentData, { rejectWithValue }) => {
    try {
      return await attachmentService.createAttachment(attachmentData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create attachment"
      );
    }
  }
);

export const updateAttachment = createAsyncThunk(
  "attachments/updateAttachment",
  async (
    { id, data }: { id: string; data: UpdateAttachmentData },
    { rejectWithValue }
  ) => {
    try {
      return await attachmentService.updateAttachment(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update attachment"
      );
    }
  }
);

export const deleteAttachment = createAsyncThunk(
  "attachments/deleteAttachment",
  async (id: string, { rejectWithValue }) => {
    try {
      await attachmentService.deleteAttachment(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete attachment"
      );
    }
  }
);

export const uploadFile = createAsyncThunk(
  "attachments/uploadFile",
  async (
    {
      file,
      organizationId,
      uploadedByUserId,
    }: { file: File; organizationId: string; uploadedByUserId: string },
    { rejectWithValue }
  ) => {
    try {
      return await attachmentService.uploadFile(
        file,
        organizationId,
        uploadedByUserId
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload file"
      );
    }
  }
);

export const downloadAttachment = createAsyncThunk(
  "attachments/downloadAttachment",
  async (id: string, { rejectWithValue }) => {
    try {
      const blob = await attachmentService.downloadAttachment(id);
      return { id, blob } as { id: string; blob: Blob };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to download attachment"
      );
    }
  }
);
