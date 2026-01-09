export interface AutomationRun {
  id: string;
  automationId: string;
  meterId: string;
  assetId: string;
  lastTriggeredAt: string;
  lastWorkOrderId: string | null;
  asset: {
    id: string;
    name: string;
  };
  meter: {
    id: string;
    name: string;
  };
}

export interface TriggerRule {
  op: string;
  value: number | string;
}

export interface TriggerScope {
  type: string;
}

export interface TriggerWhen {
  type: string;
  rules: TriggerRule[];
  scope: TriggerScope;
  meterId: string;
}

export interface AutomationTriggers {
  when: TriggerWhen[];
}

export interface AutomationConditions {
  activeWindows: any[];
}

export interface AutomationAction {
  type: string;
  status?: string;
  assetId?: string;
  [key: string]: any;
}

export interface AutomationResponse {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  isEnabled: boolean;
  triggers: AutomationTriggers;
  conditions: AutomationConditions;
  actions: AutomationAction[];
  createdAt: string;
  updatedAt: string;
  runs: AutomationRun[];
}

export interface CreateAutomationData {
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
