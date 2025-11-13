// --- [NO CHANGE] ---
export interface ConditionData {
  id: number;
  conditionOperator: string | null; // e.g., 'is', 'higher than', 'between'
  conditionValue: string | null; // e.g., 'Yes', '50', 'Option 1'
  conditionValue2: string | null; // For 'between'
  fields: FieldData[]; // Nested fields
  isCollapsed?: boolean;
}

// --- [NO CHANGE] ---
export interface FieldData {
  id: number;
  selectedType: string;
  options?: string[];
  blockType: "field" | "heading" | "section";
  label: string;
  fields?: FieldData[];
  meterUnit?: string;
  selectedMeter?: string;
  description?: string;
  hasDescription?: boolean;
  isRequired?: boolean;
  conditions?: ConditionData[];
  includeTime?: boolean;
  links?: {
    id: string;
    url: string;
    text: string;
  }[];
  attachments?: {
    id: string;
    name: string;
    url: string; // dataURL for preview
    type: string;
  }[];
}

// --- [NO CHANGE] ---
export interface ProcedureBodyProps {
  name: string;
  description: string;
}

// --- [NO CHANGE] ---
export interface ProcedureSettingsState {
  categories: string[]; 
  assets: string[];
  locations: string[];
  teamsInCharge: string[];
  visibility: "private" | "public";
  priority: string | null;
}

// --- [NO CHANGE] ---
export const logicConditionTypes: Record<string, string[]> = {
  "Number Field": [
    "higher than",
    "lower than",
    "equal to",
    "not equal to",
    "between",
  ],
  "Amount ($)": [
    "higher than",
    "lower than",
    "equal to",
    "not equal to",
    "between",
  ],
  "Meter Reading": [
    "higher than",
    "lower than",
    "equal to",
    "not equal to",
    "between",
  ],
  "Yes, No, N/A": ["is", "is not"],
  "Multiple Choice": ["is", "is not"],
  Checklist: ["contains", "does not contain"],
  "Inspection Check": ["is", "is not"],
  Checkbox: ["is checked", "is not checked"],
};


// --- 👇 [CHANGE] Update 'CreateProcedureData' and 'UpdateProcedureData' ---

interface ProcedureItemBase {
  fieldName?: string; // (field)
  text?: string; // (heading)
  sectionName?: string; // (section)
  order: number;
  // ... any other common properties
}

export interface CreateProcedureData {
  title: string;
  description?: string;
  visibility: "private" | "public";
  priority?: string | null; // Priority is optional on CREATE
  
  assetIds: string[];
  locationIds: string[];
  teamsInCharge: string[];

  headings: ProcedureItemBase[];
  rootFields: ProcedureItemBase[];
  sections: ProcedureItemBase[];
}

// This new type omits 'priority' from the partial data
// This correctly models the API which rejects 'priority' on PATCH
type UpdateProcedurePayload = Omit<Partial<CreateProcedureData>, 'priority'>;

export interface UpdateProcedureData extends UpdateProcedurePayload {}
// --- END CHANGE ---