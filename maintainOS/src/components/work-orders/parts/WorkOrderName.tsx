import { Package } from "lucide-react";

export default function WorkOrderName() {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex h-12 w-12 flex-none items-center justify-center rounded-full border bg-white text-gray-400">
        <Package className="h-5 w-5" />
      </div>
      <div className="w-full">
        <input
          type="text"
          placeholder="Enter Work Order Name (Required)"
          className="w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2 text-lg text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}
