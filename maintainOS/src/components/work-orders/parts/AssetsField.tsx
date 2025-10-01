import { ChevronDown, Search, Plus } from "lucide-react";

export default function AssetsField({ setPanel }: { setPanel: (p: any) => void }) {
  return (
    <div className="mt-8">
      <h3 className="mb-4 text-base font-medium text-gray-900">Assets</h3>

      {/* Search Input */}
      <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Start typing..."
          className="flex-1 border-0 outline-none text-gray-900 placeholder-gray-400"
        />
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      {/* Add Multiple Assets */}
      <div className="mt-4">
        <button
          onClick={() => setPanel("assets")}
          className="flex items-center gap-2 text-orange-600 text-sm cursor-pointer hover:text-orange-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add multiple assets
        </button>
      </div>
    </div>
  );
}
