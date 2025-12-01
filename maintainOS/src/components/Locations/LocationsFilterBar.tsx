import { FileText, List, Network, Settings, User } from "lucide-react";
import FilterBar from "../utils/FilterBar";

const ALL_FILTERS = [
  // Changed key 'teamsInCharge' to 'teams' to match API 'teamsOneOf'
  { key: "teams", label: "Teams in Charge", icon: <User size={16} /> },
  { key: "createdBy", label: "Created By", icon: <User size={16} /> },
  { key: "asset", label: "Asset", icon: <Network size={16} /> },
  { key: "part", label: "Part", icon: <Settings size={16} /> },
  { key: "procedure", label: "Procedure", icon: <List size={16} /> },
  { key: "vendor", label: "Vendor", icon: <FileText size={16} /> },
];

interface LocationsFilterBarProps {
  onParamsChange?: (params: any) => void;
}

export default function LocationsFilterBar({ onParamsChange }: LocationsFilterBarProps) {
  return (
    <div className="w-full">
      <FilterBar
        allFilters={ALL_FILTERS}
        defaultKeys={["teams", "createdBy", "asset"]}
        onParamsChange={onParamsChange}
      />
    </div>
  );
}