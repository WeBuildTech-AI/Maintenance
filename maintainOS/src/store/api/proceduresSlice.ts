import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  procedureService,
  type ProcedureResponse,
  type CreateProcedureData,
  type UpdateProcedureData,
} from "../../services/procedureService";

export const fetchProcedures = createAsyncThunk(
  "procedures/fetchProcedures",
  async (_, { rejectWithValue }) => {
    try {
      const procedures = await procedureService.fetchProcedures();
      return procedures;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch procedures"
      );
    }
  }
);

export const fetchProcedureById = createAsyncThunk(
  "procedures/fetchProcedureById",
  async (id: string, { rejectWithValue }) => {
    try {
      const procedure = await procedureService.fetchProcedureById(id);
      return procedure;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch procedure"
      );
    }
  }
);

export const createProcedure = createAsyncThunk(
  "procedures/createProcedure",
  async (procedureData: CreateProcedureData, { rejectWithValue }) => {
    try {
      const procedure = await procedureService.createProcedure(procedureData);
      return procedure;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create procedure"
      );
    }
  }
);

export const updateProcedure = createAsyncThunk(
  "procedures/updateProcedure",
  async (
    {
      id,
      procedureData,
    }: {
      id: string;
      procedureData: UpdateProcedureData;
    },
    { rejectWithValue }
  ) => {
    try {
      const procedure = await procedureService.updateProcedure(
        id,
        procedureData
      );
      return procedure;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update procedure"
      );
    }
  }
);

export const deleteProcedure = createAsyncThunk(
  "procedures/deleteProcedure",
  async (id: string, { rejectWithValue }) => {
    try {
      await procedureService.deleteProcedure(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete procedure"
      );
    }
  }
);

// Interface for the procedures state
interface ProceduresState {
  procedures: ProcedureResponse[];
  selectedProcedure: ProcedureResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProceduresState = {
  procedures: [],
  selectedProcedure: null,
  loading: false,
  error: null,
};

// Procedures slice
const proceduresSlice = createSlice({
  name: "procedures",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedProcedure: (
      state,
      action: PayloadAction<ProcedureResponse | null>
    ) => {
      state.selectedProcedure = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProcedures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProcedures.fulfilled, (state, action) => {
        state.loading = false;
        state.procedures = action.payload;
      })
      .addCase(fetchProcedures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch procedure by ID cases
    builder
      .addCase(fetchProcedureById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProcedureById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProcedure = action.payload;
      })
      .addCase(fetchProcedureById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create procedure cases
    builder
      .addCase(createProcedure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProcedure.fulfilled, (state, action) => {
        state.loading = false;
        state.procedures.push(action.payload);
      })
      .addCase(createProcedure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update procedure cases
    builder
      .addCase(updateProcedure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProcedure.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.procedures.findIndex(
          (procedure) => procedure.id === action.payload.id
        );
        if (index !== -1) {
          state.procedures[index] = action.payload;
        }
        if (state.selectedProcedure?.id === action.payload.id) {
          state.selectedProcedure = action.payload;
        }
      })
      .addCase(updateProcedure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete procedure cases
    builder
      .addCase(deleteProcedure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProcedure.fulfilled, (state, action) => {
        state.loading = false;
        state.procedures = state.procedures.filter(
          (procedure) => procedure.id !== action.payload
        );
        if (state.selectedProcedure?.id === action.payload) {
          state.selectedProcedure = null;
        }
      })
      .addCase(deleteProcedure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedProcedure } = proceduresSlice.actions;
export default proceduresSlice.reducer;
