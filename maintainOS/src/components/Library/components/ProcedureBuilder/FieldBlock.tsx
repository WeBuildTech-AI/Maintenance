import { Link2, Trash2, FileText } from "lucide-react";
import FieldDropdown from "./FieldDropdown";
import { FieldData } from "./types";

interface FieldBlockProps {
  field: FieldData;
  fieldTypes: { label: string; icon: JSX.Element }[];
  onTypeChange: (type: string) => void;
  onDelete?: () => void;
  renderFieldContent: (f: FieldData) => JSX.Element | null;
}

export default function FieldBlock({
  field,
  fieldTypes,
  onTypeChange,
  onDelete,
  renderFieldContent,
}: FieldBlockProps) {
  return (
    <div className="border border-blue-200 rounded-lg p-4 mb-6 relative">
      <div className="flex gap-3 mb-2">
        <input
          type="text"
          placeholder="Field Name"
          className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 w-[260px]"
        />
        <FieldDropdown
          fieldTypes={fieldTypes}
          selectedType={field.selectedType || "Text Field"}
          onChange={onTypeChange}
        />
      </div>

      {renderFieldContent(field)}

      <div className="flex justify-between items-center mt-4 text-gray-500">
        <div className="flex gap-4">
          <button className="hover:text-blue-600">
            <Link2 size={18} />
          </button>
          <button className="hover:text-blue-600">
            <FileText size={18} />
          </button>
          {onDelete && (
            <button onClick={onDelete} className="hover:text-red-500">
              <Trash2 size={18} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Required</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
            <div className="absolute left-[2px] top-[2px] bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-4"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
