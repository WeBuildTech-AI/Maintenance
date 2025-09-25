import { Settings, Trash2 } from "lucide-react";

export function CreateBlankWorkOrderForm({ onBack }: { onBack: () => void }) {
  return (
    <div className="border rounded-md shadow bg-white mb-6">
      {/* Header */}
      <div className="bg-blue-50 px-6 py-4 flex items-center justify-between rounded-t-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800 text-lg leading-none">
            ←
          </button>
          <h3 className="text-base font-semibold text-gray-900">Create from blank</h3>
        </div>
        <div className="flex items-center gap-10 pr-2">
          <button className="text-gray-600 hover:text-gray-800">
            <Settings className="h-5 w-5" />
          </button>
          <button className="text-red-600 hover:text-red-800">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Work Order Title <span className="text-red-500">(Required)</span>
          </label>
          <input
            type="text"
            placeholder="What needs to be done?"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
          <textarea
            placeholder="Add a description"
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Asset</label>
          <input
            type="text"
            placeholder="Start typing..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Assign to</label>
          <input
            type="text"
            placeholder="Type name, email or phone number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="createOnlyIfClosed" className="h-4 w-4 border-gray-300 rounded text-blue-600" />
          <label htmlFor="createOnlyIfClosed" className="text-sm text-gray-700 cursor-pointer">
            Create only if previous Work Order generated from Automation is closed
          </label>
        </div>
      </div>
    </div>
  );
}
