export interface RenderItemProps {
  item: any;
  answers: Record<string, any>;
  updateAnswer: (fieldId: string, value: any) => void;
  renderAllItems: (items: any[], allFieldsInScope: any[]) => React.ReactNode[];
  allFieldsInScope: any[];
  variant?: "preview" | "runner";
}