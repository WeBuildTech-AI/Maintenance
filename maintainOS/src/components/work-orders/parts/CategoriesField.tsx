import { ChevronDown, Search } from "lucide-react";

export default function CategoriesField() {
  return (
    <div className="mt-6">
      <h3 className="mb-4 text-base font-medium text-gray-900">Categories</h3>
      <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
        <Search className="h-4 w-4 text-gray-400" />
        <span className="flex-1 text-gray-400">Start typing...</span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
