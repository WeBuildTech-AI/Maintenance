import { useState } from "react";

const priorities = [
  { name: "None", color: "bg-blue-500", textColor: "text-white" },
  { name: "Low", color: "bg-green-500", textColor: "text-white" },
  { name: "Medium", color: "bg-orange-500", textColor: "text-white" },
  { name: "High", color: "bg-red-500", textColor: "text-white" },
];

export default function PriorityField() {
  const [selectedPriority, setSelectedPriority] = useState("None");

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-base font-medium text-gray-900">Priority</h3>
      <div className="flex w-full">
        {priorities.map((priority) => (
          <button
            key={priority.name}
            onClick={() => setSelectedPriority(priority.name)}
            className={`flex-1 px-2 py-1 text-xs font-medium transition-all duration-200 hover:opacity-90 rounded ${
              selectedPriority === priority.name
                ? `${priority.color} ${priority.textColor} shadow-sm`
                : "text-gray-700 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {priority.name}
          </button>
        ))}
      </div>
    </div>
  );
}
