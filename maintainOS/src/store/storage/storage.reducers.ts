// src/store/storage/storage.reducers.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StorageState, StorageItem } from "./storage.types";
import { deleteFilesThunk, getViewUrlThunk, uploadFileThunk } from "./storage.thunks";

const initialState: StorageState = { byForm: {} };

const ensureForm = (state: StorageState, formId: string) => {
  if (!state.byForm[formId]) state.byForm[formId] = { items: {}, order: [] };
  return state.byForm[formId];
};

export const storageSlice = createSlice({
  name: "storage",
  initialState,
  reducers: {
    registerDraftItem(
      state,
      action: PayloadAction<{ formId: string; key: string; item: StorageItem }>
    ) {
      const { formId, key, item } = action.payload;
      const form = ensureForm(state, formId);
      if (!form.items[key]) form.order.push(key);
      form.items[key] = item;
    },
    setProgress(
      state,
      action: PayloadAction<{ formId: string; key: string; progress: number }>
    ) {
      const { formId, key, progress } = action.payload;
      const form = ensureForm(state, formId);
      if (form.items[key]) {
        form.items[key].progress = progress;
      }
    },
    setStatus(
      state,
      action: PayloadAction<{ formId: string; key: string; status: StorageItem["status"]; error?: string | null }>
    ) {
      const { formId, key, status, error } = action.payload;
      const form = ensureForm(state, formId);
      if (form.items[key]) {
        form.items[key].status = status;
        form.items[key].error = error ?? null;
      }
    },
    removeItem(state, action: PayloadAction<{ formId: string; key: string }>) {
      const { formId, key } = action.payload;
      const form = ensureForm(state, formId);
      if (form.items[key]) delete form.items[key];
      form.order = form.order.filter(k => k !== key);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(uploadFileThunk.fulfilled, (state, action) => {
        const { formId, key } = action.payload;
        const form = ensureForm(state, formId);
        if (form.items[key]) {
          form.items[key].status = "success";
          form.items[key].progress = 100;
        }
      })
      .addCase(uploadFileThunk.rejected, (state, action) => {
        const { formId, key, errorMessage } = (action.payload as any) || {};
        const form = ensureForm(state, formId);
        if (key && form.items[key]) {
          form.items[key].status = "error";
          form.items[key].error = errorMessage || "Upload failed";
        }
      })
      .addCase(deleteFilesThunk.fulfilled, (state, action) => {
        const { formId, keys } = action.meta.arg;
        const form = ensureForm(state, formId);
        for (const k of keys) {
          if (form.items[k]) delete form.items[k];
        }
        form.order = form.order.filter(k => !keys.includes(k));
      })
      .addCase(getViewUrlThunk.fulfilled, (state, action) => {
        const { formId, key, url } = action.payload;
        const form = ensureForm(state, formId);
        if (form.items[key]) form.items[key].viewUrl = url;
      });
  },
});

export const { registerDraftItem, setProgress, setStatus, removeItem } = storageSlice.actions;

export default storageSlice.reducer;

// selectors
export const selectStorageForm = (formId: string) => (state: any) => state.storage.byForm[formId] || { items: {}, order: [] };
export const selectStorageItems = (formId: string) => (state: any) => {
  const f = state.storage.byForm[formId];
  if (!f) return [];
  return f.order.map((k: string) => f.items[k]);
};
