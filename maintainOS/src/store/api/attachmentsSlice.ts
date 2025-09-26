import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
// src/services/attachmentService.ts
import axios from "axios";

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


interface AttachmentsState {
  attachments: AttachmentResponse[];
  selectedAttachment: AttachmentResponse | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;
}

const initialState: AttachmentsState = {
  attachments: [],
  selectedAttachment: null,
  loading: false,
  error: null,
  uploadProgress: 0,
};

// Async thunks
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
      return { id, blob };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to download attachment"
      );
    }
  }
);

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
      // Fetch all attachments
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

      // Fetch attachment by ID
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

      // Create attachment
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

      // Update attachment
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

      // Delete attachment
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

      // Upload file
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

      // Download attachment
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
