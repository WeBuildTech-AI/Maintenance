import React, { useState, memo } from "react";
import { ChevronDown } from "lucide-react";
import type { RenderItemProps } from "../ProcedureFormTypes";

export const PreviewSection = memo(function PreviewSection({
  item: section,
  variant,
  ...props
}: RenderItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const sectionFields = section.fields || [];
  const sectionHeadings = section.headings || [];
  const combinedItems = [...sectionFields, ...sectionHeadings].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const fieldCount = sectionFields.length; 
  const sectionLabel = section.sectionName || section.label;

  return (
    <div className="mb-8 border-b border-gray-100 pb-6 last:border-0">
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="flex items-center gap-2 w-full text-left mb-4 group">
        <div className="p-1 rounded-md hover:bg-gray-100 transition-colors">
            <ChevronDown size={20} className={`text-gray-500 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : "rotate-0"}`} />
        </div>
        <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {section.sectionName || section.label}
        </span>
      </button>

      {!isCollapsed && (
        <div className="pl-4 border-l-2 border-gray-100 ml-2.5 space-y-6">
          {props.renderAllItems(combinedItems, props.allFieldsInScope)}
        </div>
      )}
    </div>
  );
});