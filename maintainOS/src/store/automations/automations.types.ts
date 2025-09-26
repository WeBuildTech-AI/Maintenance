export interface AutomationResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  isEnabled?: boolean;
  triggers?: Record<string, any>;
  conditions?: Record<string, any>;
  actions?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationData {
  organizationId: string;
  name: string;
  description?: string;
  isEnabled?: boolean;
  triggers?: Record<string, any>;
  conditions?: Record<string, any>;
  actions?: Record<string, any>;
}

export interface UpdateAutomationData {
  name?: string;
  description?: string;
  isEnabled?: boolean;
  triggers?: Record<string, any>;
  conditions?: Record<string, any>;
  actions?: Record<string, any>;
}

export interface AutomationsState {
  automations: AutomationResponse[];
  selectedAutomation: AutomationResponse | null;
  loading: boolean;
  error: string | null;
}
