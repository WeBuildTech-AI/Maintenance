import axios from "axios";

import type {
  AutomationResponse,
  CreateAutomationData,
  UpdateAutomationData,
} from "./automations.types";

const API_URL = import.meta.env.VITE_API_URL;

export const automationService = {
  fetchAutomations: async (): Promise<AutomationResponse[]> => {
    const res = await axios.get(`${API_URL}/automations`);
    return res.data;
  },

  fetchAutomationById: async (id: string): Promise<AutomationResponse> => {
    const res = await axios.get(`${API_URL}/automations/${id}`);
    return res.data;
  },

  createAutomation: async (
    data: CreateAutomationData
  ): Promise<AutomationResponse> => {
    const res = await axios.post(`${API_URL}/automations`, data);
    return res.data;
  },

  updateAutomation: async (
    id: string,
    data: UpdateAutomationData
  ): Promise<AutomationResponse> => {
    const res = await axios.patch(`${API_URL}/automations/${id}`, data);
    return res.data;
  },

  deleteAutomation: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/automations/${id}`);
  },
};
