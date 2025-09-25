import { ChevronDown } from "lucide-react";

export function ManufacturerDropdown() {
  return (
    <div className="mt-4">
      <h3 className="mb-4 text-base font-medium text-gray-900">Manufacturer</h3>
      <div className="relative">
        <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
          <span className="flex-1 text-gray-400">Start typing to search or customize...</span>
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
