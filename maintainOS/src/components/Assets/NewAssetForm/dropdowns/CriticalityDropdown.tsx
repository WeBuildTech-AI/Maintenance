import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CriticalityDropdownProps {
  criticality: string;
  setCriticality: (val: string) => void;
}

export function CriticalityDropdown({
  criticality,
  setCriticality,
}: CriticalityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const options = ["low", "medium", "high"];

  const handleSelect = (val: string) => {
    setCriticality(val);
    setIsOpen(false);
  };

  return (
    <div className="mt-4 relative w-full">
      <h3 className="mb-2 text-base font-medium text-gray-900">Criticality</h3>

      <div
        className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={`flex-1 capitalize ${
            criticality ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {criticality || "Select criticality..."}
        </span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      {isOpen && (
        <ul className="absolute left-0 top-full mt-1 w-full rounded-md capitalize border bg-white shadow-lg z-50 capa">
          {options.map((option) => (
            <li
              key={option}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
