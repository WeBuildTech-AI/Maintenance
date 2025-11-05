import { ChevronDown, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface FieldDropdownProps {
  fieldTypes: { label: string; icon: JSX.Element }[];
  selectedType: string;
  onChange: (label: string) => void;
}

export default function FieldDropdown({
  fieldTypes,
  selectedType,
  onChange,
}: FieldDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative w-[260px]" ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className={`flex items-center border ${
          open ? "border-blue-400 ring-1 ring-blue-200" : "border-gray-200"
        } rounded-md px-3 py-2 justify-between cursor-pointer bg-white hover:border-blue-400 transition`}
      >
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Search size={16} className="text-gray-400" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
              {fieldTypes.find((f) => f.label === selectedType)?.icon}
            </div>
            <span>{selectedType}</span>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-md z-50 max-h-[200px] overflow-y-auto">
          {fieldTypes.map((type) => (
            <div
              key={type.label}
              onClick={() => {
                onChange(type.label);
                setOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${
                selectedType === type.label
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  selectedType === type.label ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                {type.icon}
              </div>
              <span>{type.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
