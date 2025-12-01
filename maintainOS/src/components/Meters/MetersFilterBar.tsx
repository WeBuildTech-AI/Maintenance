import { Tag, Network, MapPin } from "lucide-react";
import FilterBar from "../utils/FilterBar";

const ALL_FILTERS = [
  // Changed key 'type' to 'meterType' to align with typical API naming if needed,
  // or keep 'type' if your backend maps 'typeOneOf' to 'meterType'.
  // Assuming 'meterType' based on types definition.
  { 
    key: "meterType", 
    label: "Type", 
    icon: <Tag size={16} />,
    options: [
      { label: "Manual", value: "manual" },
      { label: "Automated", value: "automated" }
    ] 
  },
  { key: "asset", label: "Asset", icon: <Network size={16} /> },
  { key: "location", label: "Location", icon: <MapPin size={16} /> },
];

interface MetersFilterBarProps {
  onParamsChange?: (params: any) => void;
}

export default function MetersFilterBar({ onParamsChange }: MetersFilterBarProps) {
  return (
    <FilterBar
      allFilters={ALL_FILTERS}
      defaultKeys={["meterType", "asset", "location"]}
      onParamsChange={onParamsChange}
    />
  );
}