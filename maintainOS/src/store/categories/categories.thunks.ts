import { createAsyncThunk } from "@reduxjs/toolkit";

import { categoryService } from "./categories.service";
import type {
  CreateCategoryData,
  UpdateCategoryData,
} from "./categories.types";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryService.fetchCategories();
      return categories;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (id: string, { rejectWithValue }) => {
    try {
      const category = await categoryService.fetchCategoryById(id);
      return category;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category"
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData: CreateCategoryData, { rejectWithValue }) => {
    try {
      const category = await categoryService.createCategory(categoryData);
      return category;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async (
    {
      id,
      categoryData,
    }: {
      id: string;
      categoryData: UpdateCategoryData;
    },
    { rejectWithValue }
  ) => {
    try {
      const category = await categoryService.updateCategory(id, categoryData);
      return category;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  }
);
