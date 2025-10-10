import { Tag, FileText, Repeat, Settings, MapPin, Factory, Wrench, Hash, Users, Layers, Calendar } from "lucide-react";
import FilterBar from "../../utils/FilterBar";

const ALL_FILTERS = [
  { key: "criticality", label: "Criticality", icon: <Tag size={16} /> },
  { key: "status", label: "Status", icon: <Tag size={16} /> },
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

export default function AssetFilterBar() {
  return (
    <FilterBar
      allFilters={ALL_FILTERS}
      defaultKeys={[
        "criticality",
        "status",
        "asset",
        "location"
      ]}
    />
  );
}
