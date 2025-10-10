import { MapPin, Tag, Settings } from "lucide-react";
import FilterBar from "../utils/FilterBar";

const ALL_FILTERS = [
  {
    key: "asset",
    label: "Asset",
    icon: <Settings size={16} />,
    options: ["HVAC", "Boiler", "Generator", "Pump"],
  },
  {
    key: "part",
    label: "Part",
    icon: <Tag size={16} />,
    options: ["Switch", "Cable", "Sensor", "Panel"],
  },
  {
    key: "vendorTypes",
    label: "Vendor Types",
    icon: <Settings size={16} />,
    options: ["Manufacturer", "Distributor"],
  },
  {
    key: "location",
    label: "Location",
    icon: <MapPin size={16} />,
    options: ["Mumbai", "Delhi", "Bangalore", "Hyderabad"], // static fallback (dynamic list is handled inside FilterDropdown already)
  },
];

export default function VendorFilterBar({
  onFilterChange,
}: {
  onFilterChange?: (filters: Record<string, string[]>) => void;
}) {
  // keep a local accumulator so every onFilterSelect call pushes latest state up
  const filtersState: Record<string, string[]> = {};

  return (
    <div className="px-0 py-4">
      <FilterBar
        allFilters={ALL_FILTERS}
        defaultKeys={["asset", "part", "vendorTypes", "location"]}
        onFilterSelect={(key, selectedIds) => {
          filtersState[key] = selectedIds; // IDs for location, strings for others
          console.log("🟣 VendorFilterBar (bubbling up):", filtersState);
          if (onFilterChange) onFilterChange({ ...filtersState });
        }}
      />
    </div>
  );
}
