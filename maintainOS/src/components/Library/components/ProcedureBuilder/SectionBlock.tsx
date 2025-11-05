import { Layout, MoreVertical } from "lucide-react";
import FieldBlock from "./FieldBlock";
import { FieldData } from "./types";

interface SectionBlockProps {
  field: FieldData;
  fieldTypes: { label: string; icon: JSX.Element }[];
  renderFieldContent: (f: FieldData) => JSX.Element | null;
  onAddField: (sectionId: number) => void;
  onTypeChange: (sectionId: number, subId: number, type: string) => void;
}

export default function SectionBlock({
  field,
  fieldTypes,
  renderFieldContent,
  onAddField,
  onTypeChange,
}: SectionBlockProps) {
  return (
    <div key={field.id} className="relative mb-8">
      <div className="absolute left-0 top-4 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
          <Layout size={16} />
        </div>
        <div className="flex-1 w-px bg-gray-400 mt-1 mb-1"></div>
        <div className="w-2 h-2 rotate-45 bg-gray-400"></div>
      </div>

      <div className="ml-12">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{field.label}</h3>
          <button className="text-gray-500 hover:text-gray-700">
            <MoreVertical size={20} />
          </button>
        </div>

        {field.fields?.map((subField) => (
          <FieldBlock
            key={subField.id}
            field={subField}
            fieldTypes={fieldTypes}
            onTypeChange={(t) => onTypeChange(field.id, subField.id, t)}
            renderFieldContent={renderFieldContent}
          />
        ))}

        <button
          onClick={() => onAddField(field.id)}
          className="text-blue-600 text-sm font-medium"
        >
          + Add Field
        </button>
      </div>
    </div>
  );
}
