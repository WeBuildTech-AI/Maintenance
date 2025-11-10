import { ClipboardList } from "lucide-react";

// Helper function to count all fields
function getProcedureFieldCount(procedure: any): number {
  let count = 0;
  if (procedure?.fields) {
    count += procedure.fields.length;
  }
  if (procedure?.sections) {
    count += procedure.sections.reduce((acc: number, section: any) => 
      acc + (section.fields?.length || 0), 0);
  }
  return count;
}

// Is component ko Library.tsx se procedure aur selection state receive hoga
export function LibraryCard({
  procedure,
  isSelected,
  onSelectProcedure,
}: {
  procedure: any;
  isSelected: boolean;
  onSelectProcedure: (proc: any) => void;
}) {
  // --- UPDATED: Calculate fieldsCount manually ---
  const fieldsCount = getProcedureFieldCount(procedure);
  const fieldsText = `${fieldsCount || 0} field${
    fieldsCount !== 1 ? "s" : ""
  }`;

  return (
    <div
      onClick={() => onSelectProcedure(procedure)}
      // --- Selected style changed to BLUE border ---
      className={`cursor-pointer border rounded-lg shadow-sm hover:shadow-md transition ${
        isSelected
          ? "border-blue-500 bg-blue-50" // Selected style
          : "border-gray-200 bg-white" // Default style
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon wrapper */}
          <div
            className={`h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full border ${
              isSelected
                ? "border-blue-300 bg-blue-100" // Icon BG
                : "border-gray-200 bg-gray-100"
            } text-blue-400`}
          >
            <div className="relative h-10 w-10 flex items-center justify-center rounded-full overflow-hidden">
              <ClipboardList size={24} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-start justify-between gap-3">
              {/* Title and Description */}
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {procedure.title || "Untitled Procedure"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {procedure.description || "No description"}
                </p>
              </div>
              {/* Fields Badge (WO-001 jaisa) */}
              <span className="inline-flex flex-shrink-0 items-center rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                {fieldsText}
              </span>
            </div>
            
            {/* Asset/Location */}
            <p className="text-xs text-gray-500">
              Total Fields: {fieldsText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}