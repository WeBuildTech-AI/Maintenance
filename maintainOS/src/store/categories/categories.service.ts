import axios from "axios";

import type {
  CategoryResponse,
  CreateCategoryData,
  UpdateCategoryData,
} from "./categories.types";

const API_URL = import.meta.env.VITE_API_URL;
import api from "../auth/auth.service";

export const categoryService = {
  fetchCategories: async (): Promise<CategoryResponse[]> => {
    const res = await api.get(`/categories`);
    return res.data;
  },

  fetchAllCategories: async (): Promise<CategoryResponse[]> => {
    const res = await api.get(`/categories/super`);
    return res.data;
  },

  fetchCategoryById: async (id: string): Promise<CategoryResponse> => {
    const res = await api.get(`/categories/${id}`);
    return res.data;
  },

  createCategory: async (
    data: CreateCategoryData
  ): Promise<CategoryResponse> => {
    const res = await api.post(`/categories`, data);
    return res.data;
  },

  updateCategory: async (
    id: string,
    data: UpdateCategoryData
  ): Promise<CategoryResponse> => {
    const res = await api.patch(`/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
