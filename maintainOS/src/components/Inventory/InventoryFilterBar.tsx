import { User, MapPin, Tag, Settings, Layers, Repeat, FileText, ClipboardList } from "lucide-react";
import FilterBar from "../utils/FilterBar";

const ALL_FILTERS = [
  // --- API FILTERS ---
  { key: "location", label: "Location", icon: <MapPin size={16} /> },
  { key: "asset", label: "Asset", icon: <Settings size={16} /> },
  { key: "vendor", label: "Vendor", icon: <Settings size={16} /> },
  // ✅ ADDED TEAMS IN CHARGE FILTER
  { key: "team", label: "Teams in Charge", icon: <User size={16} /> },

  // --- PART SPECIFIC FILTERS ---
  {
    key: "stockStatus",
    label: "Stock Status",
    icon: <ClipboardList size={16} />,
    options: [
      { label: "Needs Restock", value: "needs_restock" },
      { label: "In Stock", value: "in_stock" },
      { label: "Out of Stock", value: "out_of_stock" }
    ]
  },
  { key: "partType", label: "Part Type", icon: <Tag size={16} /> }, // Maps to partTypeContains
  { key: "area", label: "Area", icon: <MapPin size={16} /> }, // Maps to areaContains
  { key: "description", label: "Description", icon: <FileText size={16} /> },

  {
    key: "workOrderRecurrence",
    label: "Recurrence",
    icon: <Repeat size={16} />,
    options: [
      { label: "Repeating", value: "has_repeating" },
      { label: "Non-Repeating", value: "no_repeating" }
    ]
  },
];

interface InventoryFilterBarProps {
  onParamsChange?: (params: any) => void;
}

export default function InventoryFilterBar({ onParamsChange }: InventoryFilterBarProps) {
  return (
    <FilterBar
      allFilters={ALL_FILTERS}
      defaultKeys={["stockStatus", "partType", "location"]}
      onParamsChange={onParamsChange}
    />
  );
}