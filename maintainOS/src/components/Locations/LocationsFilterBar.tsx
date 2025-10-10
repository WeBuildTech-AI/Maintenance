import { FileText, List, Network, Settings, User } from "lucide-react";
import FilterBar from "../utils/FilterBar";

const ALL_FILTERS = [
  { key: "teamsInCharge", label: "Teams in Charge", icon: <User size={16} />, options: ["Engineering", "Procurement", "Maintenance", "QA/QC"] },
  { key: "createdBy", label: "Created By", icon: <User size={16} />, options: ["System", "Manual Entry", "Imported"] },
  { key: "asset", label: "Asset", icon: <Network size={16} />, options: ["Building A", "Line 1", "Plant 3"] },
  { key: "part", label: "Part", icon: <Settings size={16} />, options: ["Console", "Controller", "Panel", "Valve"] },
  { key: "procedure", label: "Procedure", icon: <List size={16} />, options: ["Installation", "Maintenance", "Inspection"] },
  { key: "vendor", label: "Vendor", icon: <FileText size={16} />, options: ["Siemens", "ABB", "GE", "Schneider Electric"] },
];

export default function LocationsFilterBar() {
  return (
    <div className="w-full">
      <FilterBar
        allFilters={ALL_FILTERS}
        defaultKeys={["teamsInCharge", "createdBy", "asset"]}
      />
    </div>
  );
}
