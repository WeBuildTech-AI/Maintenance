import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  OrganizationResponse,
  OrganizationsState,
} from "./organization.types";
import {
  createOrganization,
  deleteOrganization,
  fetchOrganizationById,
  fetchOrganizations,
  updateOrganization,
} from "./organization.thunks";

const initialState: OrganizationsState = {
  organizations: [],
  selectedOrganization: null,
  loading: false,
  error: null,
};

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
      })

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
      })

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
      })

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
      })

      .addCase(deleteOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = state.organizations.filter(
          (organization) => organization.id !== action.payload
        );
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
