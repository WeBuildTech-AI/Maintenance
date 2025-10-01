import { ChevronDown } from "lucide-react";

export default function TeamsField() {
  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-900 mb-1">
        Teams in Charge
      </label>
      <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-gray-100 px-4 py-3 h-12">
        <span className="flex-1 text-gray-400">Start typing…</span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
