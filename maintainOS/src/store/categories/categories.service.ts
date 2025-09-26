import axios from "axios";

import type {
  CategoryResponse,
  CreateCategoryData,
  UpdateCategoryData,
} from "./categories.types";

const API_URL = import.meta.env.VITE_API_URL;

export const categoryService = {
  fetchCategories: async (): Promise<CategoryResponse[]> => {
    const res = await axios.get(`${API_URL}/categories`);
    return res.data;
  },

  fetchCategoryById: async (id: string): Promise<CategoryResponse> => {
    const res = await axios.get(`${API_URL}/categories/${id}`);
    return res.data;
  },

  createCategory: async (
    data: CreateCategoryData
  ): Promise<CategoryResponse> => {
    const res = await axios.post(`${API_URL}/categories`, data);
    return res.data;
  },

  updateCategory: async (
    id: string,
    data: UpdateCategoryData
  ): Promise<CategoryResponse> => {
    const res = await axios.patch(`${API_URL}/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/categories/${id}`);
  },
};
