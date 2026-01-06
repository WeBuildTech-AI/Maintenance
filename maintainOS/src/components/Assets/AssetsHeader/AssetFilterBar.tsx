import { Tag, FileText, Repeat, Settings, MapPin, Factory, Wrench, Hash, Users, Layers, Calendar } from "lucide-react";
import FilterBar from "../../utils/FilterBar";

// ✅ Updated ALL_FILTERS with static options for Criticality and Status
const ALL_FILTERS = [
  { 
    key: "criticality", 
    label: "Criticality", 
    icon: <Tag size={16} />,
    // 👇 Added User's Requested Options
    options: [
      { label: "Critical", value: "high" },
      { label: "Important", value: "medium" }, // Assuming 'Important' maps to High, or use value: "Important" if backend expects that
      { label: "Normal", value: "low" }   // Assuming 'Normal' maps to Medium, or use value: "Normal"
    ]
  },
  { 
    key: "status", 
    label: "Status", 
    icon: <Tag size={16} />,
    // 👇 Added User's Requested Options
    options: [
      { label: "Online", value: "online" },
      { label: "Offline", value: "offline" },
      { label: "Do Not Track", value: "doNotTrack" } // camelCase value is usually safer for APIs
    ]
  },
  { key: "downtimeReason", label: "Downtime Reason", icon: <FileText size={16} /> },
  { key: "downtimeType", label: "Downtime Type", icon: <FileText size={16} /> },
  { key: "description", label: "Description", icon: <FileText size={16} /> },
  { key: "workOrderRecurrence", label: "Work Order Recurrence", icon: <Repeat size={16} /> },
  { key: "asset", label: "Asset", icon: <Settings size={16} /> },
  { key: "location", label: "Location", icon: <MapPin size={16} /> },
  { key: "manufacturer", label: "Manufacturer", icon: <Factory size={16} /> },
  { key: "model", label: "Model", icon: <FileText size={16} /> },
  { key: "part", label: "Part", icon: <Settings size={16} /> },
  { key: "procedure", label: "Procedure", icon: <Wrench size={16} /> },
  { key: "serialNumber", label: "Serial Number", icon: <Hash size={16} /> },
  { key: "teamsInCharge", label: "Teams in Charge", icon: <Users size={16} /> },
  { key: "assetTypes", label: "Asset Types", icon: <Layers size={16} /> },
  { key: "vendor", label: "Vendor", icon: <Factory size={16} /> },
  { key: "year", label: "Year", icon: <Calendar size={16} /> },
];

interface AssetFilterBarProps {
  onParamsChange?: (params: any) => void;
}

export default function AssetFilterBar({ onParamsChange }: AssetFilterBarProps) {
  return (
    <FilterBar
      allFilters={ALL_FILTERS}
      defaultKeys={[
        "criticality",
        "status",
        "asset",
        "location"
      ]}
      onParamsChange={onParamsChange}
    />
  );
}