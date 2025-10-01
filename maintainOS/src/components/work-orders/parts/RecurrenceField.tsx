import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function RecurrenceField() {
  const [selectedWorkType, setSelectedWorkType] = useState("Reactive");
  const [workTypeOpen, setWorkTypeOpen] = useState(false);
  const workTypes = ["Reactive", "Preventive", "Other"];

  return (
    <div className="mt-4">
      <h3 className="mb-4 text-base font-medium text-gray-900">Recurrence</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Recurrence Dropdown */}
        <div className="relative">
          <select
            className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-md text-gray-900 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
          >
            <option>Does not repeat</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>

        {/* Work Type Dropdown */}
        <div className="relative">
          <div
            onClick={() => setWorkTypeOpen(!workTypeOpen)}
            className="flex items-center justify-between h-12 px-4 border border-gray-300 rounded-md bg-white cursor-pointer"
          >
            <span className="text-gray-900 text-sm">
              Work Type:{" "}
              <span className="font-semibold">{selectedWorkType}</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-blue-500 transition-transform ${
                workTypeOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {workTypeOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-10">
              {workTypes.map((type) => (
                <div
                  key={type}
                  onClick={() => {
                    setSelectedWorkType(type);
                    setWorkTypeOpen(false);
                  }}
                  className={`px-4 py-2 cursor-pointer text-sm ${
                    selectedWorkType === type
                      ? "text-blue-600 font-semibold bg-blue-50 flex justify-between"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{type}</span>
                  {selectedWorkType === type && (
                    <span className="text-blue-600">✔</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
