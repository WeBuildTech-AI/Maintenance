import type {
  AutomationResponse,
  CreateAutomationData,
  UpdateAutomationData,
} from "./automations.types";
import api from "../auth/auth.service";

// const API_URL = import.meta.env.VITE_API_URL;

export const automationService = {
  fetchAutomations: async (): Promise<AutomationResponse[]> => {
    const res = await api.get("/automations");
    return res.data;
  },

  fetchAutomationById: async (id: string): Promise<AutomationResponse> => {
    const res = await api.get(`/automations/${id}`);
    return res.data;
  },

  createAutomation: async (
    data: CreateAutomationData
  ): Promise<AutomationResponse> => {
    const res = await api.post("/automations", data);
    return res.data;
  },

  updateAutomation: async (
    id: string,
    data: UpdateAutomationData
  ): Promise<AutomationResponse> => {
    const res = await api.patch(`/automations/${id}`, data);
    return res.data;
  },

  deleteAutomation: async (id: string): Promise<void> => {
    const res = await api.delete(`/automations/${id}`);
    return res.data;
  },

  switchAutomation: async (id: string): Promise<void> => {
    const res = await api.patch(`/automations/${id}/switch-enable`);
    return res.data

  },
};
