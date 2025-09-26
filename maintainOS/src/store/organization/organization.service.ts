import axios from "axios";

import type {
  CreateOrganizationData,
  OrganizationResponse,
  UpdateOrganizationData,
} from "./organization.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
