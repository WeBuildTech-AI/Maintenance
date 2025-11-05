import { ReactNode } from "react";

export interface ConditionData {
  id: number;
  conditionOperator: string | null; // e.g., 'is', 'higher than', 'between'
  conditionValue: string | null; // e.g., 'Yes', '50', 'Option 1'
  conditionValue2: string | null; // For 'between'
  fields: FieldData[]; // Nested fields
  isCollapsed?: boolean;
}

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
  hasDescription?: boolean; // <-- ADDED
  isRequired?: boolean; // <-- ADDED
  conditions?: ConditionData[];
}

export interface ProcedureBodyProps {
  name: string;
  description: string;
}

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