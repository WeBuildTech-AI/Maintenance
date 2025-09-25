import api from "./api";

export interface Automation {
  id : string;
  organizationId : string;
  name : string;
  description?: string;
  isEnabled : boolean;
  triggers : any;
  conditons : any;
  actions : any;
  createdAt : Date;
  updatedAt : Date;
}

// For API responses
export type AutomationResponse = Automation;

// For creating new automations
export interface CreateAutomationData {
  organizationId : string;
  name : string;
  description?: string;
  isEnabled : boolean;
  triggers : any;
  conditons : any;
  actions : any;
}

// For updating existing automations
export interface UpdateAutomationData {
  organizationId : string;
  name : string;
  description?: string;
  isEnabled : boolean;
  triggers : any;
  conditons : any;
  actions : any;
}

export const automationService = {
  // Fetch all automations
  fetchAutomations: async (): Promise<AutomationResponse[]> => {
    const response = await api.get("/automations");
    return response.data;
  },

  // Fetch automation by ID
  fetchAutomationById: async (id: string): Promise<AutomationResponse> => {
    const response = await api.get(`/automations/${id}`);
    return response.data;
  },

  // Create a new automation
  createAutomation: async (
    automationData: CreateAutomationData
  ): Promise<AutomationResponse> => {
    const response = await api.post("/automations", automationData);
    return response.data;
  },

  // Update automation
  updateAutomation: async (
    id: string,
    automationData: UpdateAutomationData
  ): Promise<AutomationResponse> => {
    const response = await api.patch(`/automations/${id}`, automationData);
    return response.data;
  },

  // Delete automation
  deleteAutomation: async (id: string): Promise<void> => {
    await api.delete(`/automations/${id}`);
  },
};
