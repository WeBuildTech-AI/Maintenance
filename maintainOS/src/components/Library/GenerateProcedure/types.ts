// ✅ FIX: Added 'export'
export interface ConditionData {
  id: number;
  conditionOperator: string | null; // e.g., 'is', 'higher than', 'between'
  conditionValue: string | null; // e.g., 'Yes', '50', 'Option 1'
  conditionValue2: string | null; // For 'between'
  fields: FieldData[]; // Nested fields
  isCollapsed?: boolean;
}

// --- 🐞 YEH INTERFACE UPDATE KIYA GAYA HAI ---
export interface FieldData {
  id: number;
  selectedType: string;
  options?: string[];
  blockType: "field" | "heading" | "section";
  label: string;
  fields?: FieldData[];
  
  // --- [CHANGE] Added new properties for Meter Reading ---
  meterUnit?: string;
  selectedMeter?: string; // This will store the ID
  selectedMeterName?: string; // This will store the Name for view mode
  lastReading?: number | string | null; // This will store the last_reading.value
  // --- END CHANGE ---
  
  description?: string;
  hasDescription?: boolean;
  isRequired?: boolean;
  conditions?: ConditionData[];
  includeTime?: boolean;

  // --- "link" ko "links" (array) bana diya ---
  links?: {
    id: string;
    url: string;
    text: string;
  }[];
  
  // --- "attachment" ko "attachments" (array) bana diya ---
  attachments?: {
    id: string;
    name: string;
    url: string; // dataURL for preview
    type: string;
  }[];
}
// --- END UPDATE ---

// ✅ FIX: Added 'export'
export interface ProcedureBodyProps {
  name: string;
  description: string;
}

// --- ADDED THIS INTERFACE ---
// ✅ FIX: Added 'export'
export interface ProcedureSettingsState {
  categories: string[]; 
  assets: string[];
  locations: string[];
  teamsInCharge: string[];
  visibility: "private" | "public";
  priority: string | null;
}
// --- END ADDITION ---

// ✅ FIX: Added 'export'
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

// --- [NO CHANGE] ---
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
  priority?: string | null; 
  
  assetIds: string[];
  locationIds: string[];
  teamsInCharge: string[];

  headings: ProcedureItemBase[];
  rootFields: ProcedureItemBase[];
  sections: ProcedureItemBase[];
}

type UpdateProcedurePayload = Omit<Partial<CreateProcedureData>, 'priority'>;

export interface UpdateProcedureData extends UpdateProcedurePayload {}