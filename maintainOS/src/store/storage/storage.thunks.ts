// src/store/storage/storage.thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { DeleteFilesPayload, GetViewUrlPayload, UploadFilePayload } from "./storage.types";
import { presignGet, presignPut, uploadWithProgress, deleteObjects, openPresignedGet, fetchThumbnailService } from "./storage.service";
import {  setStatus } from "./storage.reducers";

export const uploadFileThunk = createAsyncThunk<
  { formId: string; key: string }, // return type
  UploadFilePayload,               // argument type
  { rejectValue: string }          // error type
>(
  "storage/uploadFile",
  async ({ formId, file }, { rejectWithValue }) => {
    try {
      // Step 1 — get presigned PUT URL
      const presign = await presignPut(file.type);

      // Step 2 — upload directly using the presigned URL
      await uploadWithProgress(presign.url, file);

      // Step 3 — return key metadata
      return { formId, key: presign.key };
    } catch (err: any) {
      console.error("uploadFileThunk error:", err);
      return rejectWithValue(err?.message || "Upload failed");
    }
  }
);

export const uploadMultipleFilesThunk = createAsyncThunk<
  { formId: string; results: { key: string }[] },
  { formId: string; files: File[] },
  { rejectValue: string }
>(
  "storage/uploadMultipleFiles",
  async ({ formId, files }, { dispatch, rejectWithValue }) => {
    try {
      const results = await Promise.all(
        files.map((file) => dispatch(uploadFileThunk({ formId, file })).unwrap())
      );
      console.log("Results from the uploadFileThunk", results)
      return { formId, results };
    } catch (err: any) {
      return rejectWithValue(err?.message || "Some uploads failed");
    }
  }
);




export const deleteFilesThunk = createAsyncThunk(
  "storage/deleteFiles",
  async ({ formId, keys }: DeleteFilesPayload, { dispatch, rejectWithValue }) => {
    // optimistic UI (optional): mark as deleting
    for (const key of keys) {
      dispatch(setStatus({ formId, key, status: "deleting" }));
    }
    try {
      await deleteObjects(keys);
      return true;
    } catch (e: any) {
      // rollback statuses to error
      for (const key of keys) {
        dispatch(setStatus({ formId, key, status: "error", error: e.message || "Delete failed" }));
      }
      return rejectWithValue(e.message || "Delete failed");
    }
  }
);

export const getViewUrlThunk = createAsyncThunk<
  { formId: string; key: string; url: string },
  GetViewUrlPayload
>(
  "storage/getViewUrl",
  async ({ formId, key }) => {
    const { url } = await presignGet(key);
    return { formId, key, url };
  }
);

export const openViewUrlThunk = createAsyncThunk<
  { formId: string; key: string; url: string },
  GetViewUrlPayload
>(
  "storage/openViewUrl",
  async ({ formId, key }) => {
    const url = await openPresignedGet(key, false); // ⬅️ false means don't auto-open
    return { formId, key, url };
  }
);

export const fetchThumbnailThunk = createAsyncThunk<
  { key: string; blobUrl: string },  // ✅ return type
  string,                            // ✅ argument type (key)
  { rejectValue: string }            // ✅ reject type
>(
  "storage/fetchThumbnail",
  async (key, { rejectWithValue }) => {
    try {
      return await fetchThumbnailService(key);
    } catch (err: any) {
      console.error("fetchThumbnailThunk error:", err);
      return rejectWithValue(err?.message || "Failed to fetch thumbnail");
    }
  }
);