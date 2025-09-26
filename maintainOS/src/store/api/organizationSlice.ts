import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";

// API base URL (point to your backend)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const organizationService = {
  fetchOrganizations: async (): Promise<OrganizationResponse[]> => {
    const res = await axios.get(`${API_URL}/organizations`);
    return res.data;
  },

  fetchOrganizationById: async (id: string): Promise<OrganizationResponse> => {
    const res = await axios.get(`${API_URL}/organizations/${id}`);
    return res.data;
  },

  createOrganization: async (
    data: CreateOrganizationData
  ): Promise<OrganizationResponse> => {
    const res = await axios.post(`${API_URL}/organizations`, data);
    return res.data;
  },

  updateOrganization: async (
    id: string,
    data: UpdateOrganizationData
  ): Promise<OrganizationResponse> => {
    const res = await axios.patch(`${API_URL}/organizations/${id}`, data);
    return res.data;
  },

  deleteOrganization: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/organizations/${id}`);
  },
};


export const fetchOrganizations = createAsyncThunk(
  "organizations/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const organizations = await organizationService.fetchOrganizations();
      return organizations;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch organizations"
      );
    }
  }
);

export const fetchOrganizationById = createAsyncThunk(
  "organizations/fetchOrganizationById",
  async (id: string, { rejectWithValue }) => {
    try {
      const organization = await organizationService.fetchOrganizationById(id);
      return organization;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch organization"
      );
    }
  }
);

export const createOrganization = createAsyncThunk(
  "organizations/createOrganization",
  async (organizationData: CreateOrganizationData, { rejectWithValue }) => {
    try {
      const organization = await organizationService.createOrganization(
        organizationData
      );
      return organization;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create organization"
      );
    }
  }
);

export const updateOrganization = createAsyncThunk(
  "organizations/updateOrganization",
  async (
    {
      id,
      organizationData,
    }: {
      id: string;
      organizationData: UpdateOrganizationData;
    },
    { rejectWithValue }
  ) => {
    try {
      const organization = await organizationService.updateOrganization(
        id,
        organizationData
      );
      return organization;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update organization"
      );
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  "organizations/deleteOrganization",
  async (id: string, { rejectWithValue }) => {
    try {
      await organizationService.deleteOrganization(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete organization"
      );
    }
  }
);

// Interface
export interface OrganizationResponse {
  id: string;
  name: string;
  industry?: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationData {
  name: string;
  industry?: string;
  size?: number;
}

export interface UpdateOrganizationData {
  name?: string;
  industry?: string;
  size?: number;
}

interface OrganizationsState {
  organizations: OrganizationResponse[];
  selectedOrganization: OrganizationResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationsState = {
  organizations: [],
  selectedOrganization: null,
  loading: false,
  error: null,
};

// Organizations slice
const organizationsSlice = createSlice({
  name: "organizations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedOrganization: (
      state,
      action: PayloadAction<OrganizationResponse | null>
    ) => {
      state.selectedOrganization = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchOrganizationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrganization = action.payload;
      })
      .addCase(fetchOrganizationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations.push(action.payload);
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.organizations.findIndex(
          (organization) => organization.id === action.payload.id
        );
        if (index !== -1) {
          state.organizations[index] = action.payload;
        }
        if (state.selectedOrganization?.id === action.payload.id) {
          state.selectedOrganization = action.payload;
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete
    builder
      .addCase(deleteOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = state.organizations.filter((organization) => organization.id !== action.payload);
        if (state.selectedOrganization?.id === action.payload) {
          state.selectedOrganization = null;
        }
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedOrganization } =
  organizationsSlice.actions;
export default organizationsSlice.reducer;
