import api from "./api";

// Type definitions
export type UserVisibility = "full" | "limited";

export type RateVisibility = "view_only" | "view_and_edit" | "hidden";

export type IndustryType =
  | "manufacturing"
  | "real_estate"
  | "healthcare"
  | "hospitality"
  | "education"
  | "other";

export interface Organization {
  id: string;
  name: string;
  industry?: IndustryType;
  size?: number;
  defaultWorkOrderVisibility: UserVisibility;
  defaultHourlyRate?: number;
  defaultRateVisibility?: RateVisibility;
  defaultWorkingDays?: string[];
  defaultHoursPerDay?: number;
  defaultSchedulableUser?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizationResponse = Organization;

export interface CreateOrganizationData {
  name: string;
  industry?: IndustryType;
  size?: number;
  defaultWorkOrderVisibility: UserVisibility;
  defaultHourlyRate?: number;
  defaultRateVisibility?: RateVisibility;
  defaultWorkingDays?: string[];
  defaultHoursPerDay?: number;
  defaultSchedulableUser?: boolean;
}

export interface UpdateOrganizationData {
  name: string;
  industry?: IndustryType;
  size?: number;
  defaultWorkOrderVisibility: UserVisibility;
  defaultHourlyRate?: number;
  defaultRateVisibility?: RateVisibility;
  defaultWorkingDays?: string[];
  defaultHoursPerDay?: number;
  defaultSchedulableUser?: boolean;
}

export const organizationService = {
  fetchOrganizations: async (): Promise<OrganizationResponse[]> => {
    const response = await api.get("/organizations");
    return response.data;
  },

  fetchOrganizationById: async (id: string): Promise<OrganizationResponse> => {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  },

  createOrganization: async (
    organizationData: CreateOrganizationData
  ): Promise<OrganizationResponse> => {
    const response = await api.post("/organizations", organizationData);
    return response.data;
  },

  updateOrganization: async (
    id: string,
    organizationData: UpdateOrganizationData
  ): Promise<OrganizationResponse> => {
    const response = await api.patch(`/organizations/${id}`, organizationData);
    return response.data;
  },

  deleteOrganization: async (id: string): Promise<void> => {
    await api.delete(`/organizations/${id}`);
  },
};
