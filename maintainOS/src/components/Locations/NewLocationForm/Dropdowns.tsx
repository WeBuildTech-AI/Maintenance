"use client";

import { ChevronDown, Search } from "lucide-react";

type Stage = "teams" | "vendors" | "parent";

type DropdownsProps = {
  stage: Stage;
  open: boolean;
  setOpen: (v: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  navigate: (path: string) => void;
  options: string[]; // available choices
  value: string | string[]; // current selection
  onSelect: (val: string) => void; // callback to parent
};

export function Dropdowns({
  stage,
  open,
  setOpen,
  containerRef,
  navigate,
  options,
  value,
  onSelect,
}: DropdownsProps) {
  const label =
    stage === "teams"
      ? "Teams in Charge"
      : stage === "vendors"
      ? "Vendors"
      : "Parent Location";

  const cta =
    stage === "teams"
      ? { text: "+ Create New Team", path: "/team-users" }
      : stage === "vendors"
      ? { text: "+ Create New Vendor", path: "/vendors" }
      : { text: "+ Create New Parent Location", path: "/locations" };

  return (
    <div className="relative" ref={containerRef}>
      <h3 className="mb-2 text-base font-medium text-gray-900">{label}</h3>
      <div
        className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <Search className="h-4 w-4 text-gray-400" />
        <span className="flex-1 text-gray-600">
          {Array.isArray(value)
            ? value.join(", ") || "Select..."
            : value || "Select..."}
        </span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white shadow-lg z-50">
          {/* CTA */}
          <div
            onClick={() => navigate(cta.path)}
            className="relative flex items-center px-4 py-2  rounded-md text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-l-md" />
            <span className="ml-3">{cta.text}</span>
          </div>

          {/* Options */}
          {/* {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                (Array.isArray(value) && value.includes(opt)) || value === opt
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              {opt}
            </div>
          ))} */}
        </div>
      )}
    </div>
  );
}
