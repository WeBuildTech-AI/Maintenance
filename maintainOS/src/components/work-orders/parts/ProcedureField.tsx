import { Plus } from "lucide-react";

export default function ProcedureField({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Procedure</h2>
      <div className="flex justify-center items-center gap-3 mb-6">
        <svg
          className="w-5 h-5 text-blue-500 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-base text-gray-600">
          Create or attach new Form, Procedure or Checklist
        </span>
      </div>
      <div className="flex justify-center items-center">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-orange-600 border border-orange-600 rounded-sm hover:bg-orange-50 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Procedure
        </button>
      </div>
    </div>
  );
}
