import { Network, MapPin } from "lucide-react";
import FilterBar from "../utils/FilterBar";

const ALL_FILTERS = [
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
      defaultKeys={["asset", "location"]}
      onParamsChange={onParamsChange}
    />
  );
}