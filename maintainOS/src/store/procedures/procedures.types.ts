export interface ProcedureResponse {
  id: string;
  organizationId: string;
  title: string;
  assetIds?: string[];
  type?: "maintenance" | "inspection" | "safety_check";
  frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  description?: string;
  files?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProcedureData {
  organizationId: string;
  title: string;
  assetIds?: string[];
  type?: "maintenance" | "inspection" | "safety_check";
  frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  description?: string;
  files?: string[];
}

export interface UpdateProcedureData {
  title?: string;
  assetIds?: string[];
  type?: "maintenance" | "inspection" | "safety_check";
  frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  description?: string;
  files?: string[];
}

// ✅ UPDATED: Changed 'title' to 'search' to match API
export interface FetchProceduresParams {
  page?: number | string;
  limit?: number | string;
  search?: string; 
  
  // Dynamic Keys from QueryBuilder (e.g. statusOneOf, assetIsEmpty)
  [key: string]: any; 
}

export interface ProceduresState {
  procedures: ProcedureResponse[];
  selectedProcedure: ProcedureResponse | null;
  loading: boolean;
  error: string | null;
}