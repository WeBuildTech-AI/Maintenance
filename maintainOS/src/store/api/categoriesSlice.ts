import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// src/services/categoryService.ts
import axios from "axios";

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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

// Interface for the categories state
interface CategoriesState {
  categories: CategoryResponse[];
  selectedCategory: CategoryResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
};

// Categories slice
const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCategory: (
      state,
      action: PayloadAction<CategoryResponse | null>
    ) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories cases
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch category by ID cases
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create category cases
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update category cases
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(
          (category) => category.id === action.payload.id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.selectedCategory?.id === action.payload.id) {
          state.selectedCategory = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete category cases
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (category) => category.id !== action.payload
        );
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
