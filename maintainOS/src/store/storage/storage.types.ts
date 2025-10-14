// src/store/storage/storage.types.ts

export type UploadStatus = "idle" | "presigning" | "uploading" | "success" | "error" | "deleting";

export interface StorageItem {
  key: string;                // S3/B2 object key
  fileName?: string;
  contentType?: string;
  size?: number;
  progress?: number;          // 0..100
  status: UploadStatus;
  error?: string | null;
  viewUrl?: string;           // short-lived presigned GET
}

export interface StorageState {
  // grouped by formId so many forms can upload in parallel without clobbering each other
  byForm: Record<string, {
    items: Record<string, StorageItem>; // keyed by object key
    order: string[];                    // stable ordering
  }>;
}

// payloads

export interface UploadFilePayload {
  formId: string;
  file: File;
  desiredKey?: string;
}

export interface DeleteFilesPayload {
  formId: string;
  keys: string[];
}

export interface GetViewUrlPayload {
  formId: string;
  key: string;
}
