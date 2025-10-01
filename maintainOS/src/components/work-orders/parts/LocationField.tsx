import { ChevronDown, MapPin } from "lucide-react";

export default function LocationField() {
  return (
    <div className="mt-4">
      <h3 className="mb-4 text-base font-medium text-gray-900">Location</h3>
      <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
        <MapPin className="h-5 w-5 text-blue-500" />
        <span className="flex-1 text-gray-900">General</span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
