import { User, MapPin, Tag, Settings, Repeat, Layers, FileText, ClipboardList } from "lucide-react";
import FilterBar from "../utils/FilterBar";

// ✅ EXACT OPTIONS FOR PROCEDURES
const ALL_FILTERS = [
  // --- API FILTERS (Fetch data dynamically) ---
  { key: "asset", label: "Asset", icon: <Settings size={16} /> }, 
  { key: "category", label: "Category", icon: <Layers size={16} /> },
  { key: "createdBy", label: "Created By", icon: <User size={16} /> }, // Maps to 'user' in fetcher
  
  // --- HARDCODED FILTERS (Based on Procedure Types) ---
  { 
    key: "type", 
    label: "Type", 
    icon: <ClipboardList size={16} />,
    options: [
      { label: "Maintenance", value: "maintenance" },
      { label: "Inspection", value: "inspection" },
      { label: "Safety Check", value: "safety_check" }
    ]
  },
  { 
    key: "frequency", 
    label: "Frequency", 
    icon: <Repeat size={16} />,
    options: [
      { label: "Daily", value: "daily" },
      { label: "Weekly", value: "weekly" },
      { label: "Monthly", value: "monthly" },
      { label: "Quarterly", value: "quarterly" },
      { label: "Yearly", value: "yearly" }
    ]
  },
];

interface LibraryFilterBarProps {
  onParamsChange?: (params: any) => void;
}

export default function LibraryFilterBar({ onParamsChange }: LibraryFilterBarProps) {
  return (
    <FilterBar
      allFilters={ALL_FILTERS}
      defaultKeys={["type", "frequency", "asset"]}
      onParamsChange={onParamsChange}
    />
  );
}