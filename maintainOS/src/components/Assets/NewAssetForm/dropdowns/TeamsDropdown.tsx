import { ChevronDown, Search } from "lucide-react";
import { RefObject } from "react";
import { useNavigate } from "react-router-dom";

interface LocationDropdownProps {
  teamOpen: boolean;
  setteamsOpen: (open: boolean) => void;
  teamRef: RefObject<HTMLDivElement>;
}

export function TeamsDropdown({
  teamOpen,
  setteamsOpen,
  teamRef,
}: LocationDropdownProps) {
  const navigate = useNavigate(); // ✅ Use React Router's hook

  return (
    <div className="relative" ref={teamRef}>
      <h3 className="mb-2 text-base font-medium text-gray-900">Teams</h3>

      <div
        className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
        onClick={() => setteamsOpen(!teamOpen)}
      >
        <Search className="h-4 w-4 text-gray-400" />
        <span className="flex-1 text-gray-600">Select...</span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      {teamOpen && (
        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white shadow-lg z-50">
          {/* CTA */}
          <div
            onClick={() => navigate("/teams/create")} // ✅ Navigate works now
            className="relative flex items-center px-4 py-2 rounded-md text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-l-md" />
            <span className="ml-3">Create Team</span>
          </div>
        </div>
      )}
    </div>
  );
}

// /* <div className="mt-4">
//    <h3 className="mb-4 text-base font-medium text-gray-900">Location</h3>
//    <div className="relative">
//      <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
//        <MapPin className="h-5 w-5 text-blue-500" />
//        <span className="flex-1 text-gray-900">General</span>
//        <ChevronDown className="h-5 w-5 text-gray-400" />
//      </div>
//    </div>
//  </div>
