export interface FieldData {
  id: number;
  selectedType?: string; // ✅ Optional — fixes your TS error
  options?: string[];
  blockType: "field" | "heading" | "section";
  label?: string;
  isEditing?: boolean;
  fields?: FieldData[];
}

export interface ProcedureBodyProps {
  name: string;
  description: string;
}
