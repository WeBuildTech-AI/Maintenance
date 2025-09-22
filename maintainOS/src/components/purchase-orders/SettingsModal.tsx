import { useState } from "react";
import { X } from "lucide-react";
import type { SettingsModalProps, ColumnConfig } from "./po.types";


export default function SettingsModal({
  allColumns,
  selectedColumns,
  onClose,
  onSave,
  initialPageSize,
}: SettingsModalProps) {
  const [localColumns, setLocalColumns] = useState<ColumnConfig[]>(selectedColumns);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const toggleColumn = (key: string) => {
    setLocalColumns((prev) =>
      prev.some((col) => col.key === key)
        ? prev.filter((c) => c.key !== key)
        : [...prev, allColumns.find((c) => c.key === key)!]
    );
  };

  const handleSave = () => {
    onSave(localColumns, pageSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-green-600">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Table Settings</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Columns */}
          <div>
            <h3 className="text-sm font-medium mb-2">Select Columns</h3>
            <div className="grid grid-cols-2 gap-2">
              {allColumns.map((col) => (
                <label key={col.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={localColumns.some((c) => c.key === col.key)}
                    onChange={() => toggleColumn(col.key)}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          </div>

          {/* Page Size */}
          <div>
            <h3 className="text-sm font-medium mb-2">Rows per Page</h3>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded-md px-3 py-2 text-sm w-full"
            >
              {[25, 50, 100, 200].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
