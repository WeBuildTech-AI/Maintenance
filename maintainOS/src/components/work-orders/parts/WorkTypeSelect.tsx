import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function WorkTypeSelect() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Reactive");
  const workTypes = ["Reactive", "Preventive", "Other"];

  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-900 mb-1">Work Type</label>
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between cursor-pointer border px-4 py-3 rounded-md bg-white"
      >
        <span>{selected}</span>
        <ChevronDown
          className={`ml-2 h-4 w-4 text-blue-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <div className="absolute mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-10">
          {workTypes.map((type) => (
            <div
              key={type}
              onClick={() => {
                setSelected(type);
                setOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer text-sm ${
                selected === type
                  ? "text-blue-600 font-semibold bg-blue-50 flex justify-between"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{type}</span>
              {selected === type && <span className="text-blue-600">✔</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
