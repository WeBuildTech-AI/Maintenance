import api from "./api";

// Type definitions

export type CategoryIcons = "wrench" | "bolt" | "gear" | "electric" | "plumbing" | "havoc";

export interface Category {
  id : string;
  organizationId : string;
  name : string;
  categoryIcon?: CategoryIcons;
  description?: string;
  createdAt : Date;
  updatedAt : Date;
}
// For API responses
export type CategoryResponse = Category;

// For creating new categories
export interface CreateCategoryData {
  organizationId : string;
  name : string;
  categoryIcon?: CategoryIcons;
  description?: string;
}

// For updating existing categories
export interface UpdateCategoryData {
  organizationId : string;
  name : string;
  categoryIcon?: CategoryIcons;
  description?: string;
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
