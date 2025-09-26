import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  automationService,
  type AutomationResponse,
  type CreateAutomationData,
  type UpdateAutomationData,
} from "../../services/automationService";

export const fetchAutomations = createAsyncThunk(
  "automations/fetchAutomations",
  async (_, { rejectWithValue }) => {
    try {
      const automations = await automationService.fetchAutomations();
      return automations;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch automations"
      );
    }
  }
);

export const fetchAutomationById = createAsyncThunk(
  "automations/fetchAutomationById",
  async (id: string, { rejectWithValue }) => {
    try {
      const automation = await automationService.fetchAutomationById(id);
      return automation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch automation"
      );
    }
  }
);

export const createAutomation = createAsyncThunk(
  "automations/createAutomation",
  async (automationData: CreateAutomationData, { rejectWithValue }) => {
    try {
      const automation = await automationService.createAutomation(
        automationData
      );
      return automation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create automation"
      );
    }
  }
);

export const updateAutomation = createAsyncThunk(
  "automations/updateAutomation",
  async (
    {
      id,
      automationData,
    }: {
      id: string;
      automationData: UpdateAutomationData;
    },
    { rejectWithValue }
  ) => {
    try {
      const automation = await automationService.updateAutomation(
        id,
        automationData
      );
      return automation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update automation"
      );
    }
  }
);

export const deleteAutomation = createAsyncThunk(
  "automations/deleteAutomation",
  async (id: string, { rejectWithValue }) => {
    try {
      await automationService.deleteAutomation(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete automation"
      );
    }
  }
);

// Interface for the automations state
interface AutomationsState {
  automations: AutomationResponse[];
  selectedAutomation: AutomationResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: AutomationsState = {
  automations: [],
  selectedAutomation: null,
  loading: false,
  error: null,
};

// Automations slice
const automationsSlice = createSlice({
  name: "automations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAutomation: (
      state,
      action: PayloadAction<AutomationResponse | null>
    ) => {
      state.selectedAutomation = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch automations cases
    builder
      .addCase(fetchAutomations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAutomations.fulfilled, (state, action) => {
        state.loading = false;
        state.automations = action.payload;
      })
      .addCase(fetchAutomations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch automation by ID cases
    builder
      .addCase(fetchAutomationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAutomationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAutomation = action.payload;
      })
      .addCase(fetchAutomationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create automation cases
    builder
      .addCase(createAutomation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAutomation.fulfilled, (state, action) => {
        state.loading = false;
        state.automations.push(action.payload);
      })
      .addCase(createAutomation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update automation cases
    builder
      .addCase(updateAutomation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAutomation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.automations.findIndex(
          (automation) => automation.id === action.payload.id
        );
        if (index !== -1) {
          state.automations[index] = action.payload;
        }
        if (state.selectedAutomation?.id === action.payload.id) {
          state.selectedAutomation = action.payload;
        }
      })
      .addCase(updateAutomation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete automation cases
    builder
      .addCase(deleteAutomation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAutomation.fulfilled, (state, action) => {
        state.loading = false;
        state.automations = state.automations.filter(
          (automation) => automation.id !== action.payload
        );
        if (state.selectedAutomation?.id === action.payload) {
          state.selectedAutomation = null;
        }
      })
      .addCase(deleteAutomation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedAutomation } = automationsSlice.actions;
export default automationsSlice.reducer;
