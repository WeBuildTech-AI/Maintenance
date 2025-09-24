import api from "./api";
import type { Category } from "@prisma/client";

// Re-export Prisma types for convenience
export type { Category } from "@prisma/client";

// For API responses
export type CategoryResponse = Category;

// For creating new categories
export interface CreateCategoryData {
  organizationId: string;
  name: string;
  description?: string;
  color?: string;
  parentCategoryId?: string;
}

// For updating existing categories
export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
  parentCategoryId?: string;
}

export const categoryService = {
  // Fetch all categories
  fetchCategories: async (): Promise<CategoryResponse[]> => {
    const response = await api.get("/categories");
    return response.data;
  },

  // Fetch category by ID
  fetchCategoryById: async (id: string): Promise<CategoryResponse> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create a new category
  createCategory: async (
    categoryData: CreateCategoryData
  ): Promise<CategoryResponse> => {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (
    id: string,
    categoryData: UpdateCategoryData
  ): Promise<CategoryResponse> => {
    const response = await api.patch(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
