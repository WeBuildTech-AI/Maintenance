import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  AttachmentResponse,
  AttachmentsState,
} from "./attachments.types";
import {
  createAttachment,
  deleteAttachment,
  downloadAttachment,
  fetchAttachmentById,
  fetchAttachments,
  updateAttachment,
  uploadFile,
} from "./attachments.thunks";

const initialState: AttachmentsState = {
  attachments: [],
  selectedAttachment: null,
  loading: false,
  error: null,
  uploadProgress: 0,
};

const attachmentsSlice = createSlice({
  name: "attachments",
  initialState,
  reducers: {
    clearSelectedAttachment: (state) => {
      state.selectedAttachment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAttachments.fulfilled,
        (state, action: PayloadAction<AttachmentResponse[]>) => {
          state.loading = false;
          state.attachments = action.payload;
        }
      )
      .addCase(fetchAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAttachmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAttachmentById.fulfilled,
        (state, action: PayloadAction<AttachmentResponse>) => {
          state.loading = false;
          state.selectedAttachment = action.payload;
        }
      )
      .addCase(fetchAttachmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createAttachment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createAttachment.fulfilled,
        (state, action: PayloadAction<AttachmentResponse>) => {
          state.loading = false;
          state.attachments.push(action.payload);
        }
      )
      .addCase(createAttachment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateAttachment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateAttachment.fulfilled,
        (state, action: PayloadAction<AttachmentResponse>) => {
          state.loading = false;
          const index = state.attachments.findIndex(
            (attachment) => attachment.id === action.payload.id
          );
          if (index !== -1) {
            state.attachments[index] = action.payload;
          }
          if (state.selectedAttachment?.id === action.payload.id) {
            state.selectedAttachment = action.payload;
          }
        }
      )
      .addCase(updateAttachment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteAttachment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteAttachment.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.attachments = state.attachments.filter(
            (attachment) => attachment.id !== action.payload
          );
          if (state.selectedAttachment?.id === action.payload) {
            state.selectedAttachment = null;
          }
        }
      )
      .addCase(deleteAttachment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(
        uploadFile.fulfilled,
        (state, action: PayloadAction<AttachmentResponse>) => {
          state.loading = false;
          state.uploadProgress = 100;
          state.attachments.push(action.payload);
        }
      )
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.uploadProgress = 0;
      })

      .addCase(downloadAttachment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadAttachment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadAttachment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSelectedAttachment,
  clearError,
  setUploadProgress,
  resetUploadProgress,
} = attachmentsSlice.actions;
export default attachmentsSlice.reducer;
