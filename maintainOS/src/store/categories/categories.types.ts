export interface CategoryResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  organizationId: string;
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
}

export interface CategoriesState {
  categories: CategoryResponse[];
  selectedCategory: CategoryResponse | null;
  loading: boolean;
  error: string | null;
}
