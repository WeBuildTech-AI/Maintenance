export interface OrganizationResponse {
  id: string;
  name: string;
  industry?: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationData {
  name: string;
  industry?: string;
  size?: number;
}

export interface UpdateOrganizationData {
  name?: string;
  industry?: string;
  size?: number;
}

export interface OrganizationsState {
  organizations: OrganizationResponse[];
  selectedOrganization: OrganizationResponse | null;
  loading: boolean;
  error: string | null;
}
