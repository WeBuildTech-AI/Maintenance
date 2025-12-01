import { MapPin, Tag, Settings, Briefcase } from "lucide-react";
import FilterBar from "../utils/FilterBar";

const ALL_FILTERS = [
  // --- API FILTERS ---
  { key: "asset", label: "Asset", icon: <Settings size={16} /> },
  { key: "part", label: "Part", icon: <Tag size={16} /> },
  { key: "location", label: "Location", icon: <MapPin size={16} /> },

  // --- HARDCODED FILTERS ---
  {
    key: "vendorType", // Key matches API param base (e.g. vendorTypeOneOf)
    label: "Vendor Type",
    icon: <Briefcase size={16} />,
    options: [
      { label: "Manufacturer", value: "manufacturer" },
      { label: "Distributor", value: "distributor" },
    ],
  },
];

interface VendorFilterBarProps {
  onParamsChange?: (params: any) => void;
}

export default function VendorFilterBar({ onParamsChange }: VendorFilterBarProps) {
  return (
    <div className="px-0 py-4">
      <FilterBar
        allFilters={ALL_FILTERS}
        defaultKeys={["vendorType", "location", "asset"]}
        onParamsChange={onParamsChange}
      />
    </div>
  );
}