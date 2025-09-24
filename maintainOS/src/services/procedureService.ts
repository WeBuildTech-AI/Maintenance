import api from "./api";
import type {
  Procedure,
  ProcedureType,
  ProcedureFrequency,
} from "@prisma/client";

// Re-export Prisma types for convenience
export type {
  Procedure,
  ProcedureType,
  ProcedureFrequency,
} from "@prisma/client";

// For API responses
export type ProcedureResponse = Procedure;

// For creating new procedures
export interface CreateProcedureData {
  organizationId: string;
  name: string;
  description?: string;
  type: ProcedureType;
  frequency: ProcedureFrequency;
  estimatedDuration?: number;
  instructions?: string;
  safetyNotes?: string;
  isActive?: boolean;
}

// For updating existing procedures
export interface UpdateProcedureData {
  name?: string;
  description?: string;
  type?: ProcedureType;
  frequency?: ProcedureFrequency;
  estimatedDuration?: number;
  instructions?: string;
  safetyNotes?: string;
  isActive?: boolean;
}

export const procedureService = {
  // Fetch all procedures
  fetchProcedures: async (): Promise<ProcedureResponse[]> => {
    const response = await api.get("/procedures");
    return response.data;
  },

  // Fetch procedure by ID
  fetchProcedureById: async (id: string): Promise<ProcedureResponse> => {
    const response = await api.get(`/procedures/${id}`);
    return response.data;
  },

  // Create a new procedure
  createProcedure: async (
    procedureData: CreateProcedureData
  ): Promise<ProcedureResponse> => {
    const response = await api.post("/procedures", procedureData);
    return response.data;
  },

  // Update procedure
  updateProcedure: async (
    id: string,
    procedureData: UpdateProcedureData
  ): Promise<ProcedureResponse> => {
    const response = await api.patch(`/procedures/${id}`, procedureData);
    return response.data;
  },

  // Delete procedure
  deleteProcedure: async (id: string): Promise<void> => {
    await api.delete(`/procedures/${id}`);
  },
};
