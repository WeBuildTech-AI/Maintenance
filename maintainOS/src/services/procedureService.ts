import api from "./api";

export type ProcedureType = "maintenance" | "inspection" | "safety_check";

export type ProcedureFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export interface Procedure {
  id: string;
  organizationId: string;
  title: string;
  assetIds: string[];
  type?: ProcedureType; 
  frequency?: ProcedureFrequency; 
  description?: string; 
  files: string[];
  createdAt: Date;
  updatedAt: Date;
}

// For API responses
export type ProcedureResponse = Procedure;

// For creating new procedures
export interface CreateProcedureData {
  organizationId: string;
  title: string;
  assetIds: string[];
  type?: ProcedureType; 
  frequency?: ProcedureFrequency; 
  description?: string; 
  files: string[];
}

// For updating existing procedures
export interface UpdateProcedureData {
  organizationId: string;
  title: string;
  assetIds: string[];
  type?: ProcedureType; 
  frequency?: ProcedureFrequency; 
  description?: string; 
  files: string[];
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
