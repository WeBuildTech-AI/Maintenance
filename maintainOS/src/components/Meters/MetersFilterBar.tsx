import { Tag, Network, MapPin } from "lucide-react";
import FilterBar from "../utils/FilterBar";

const ALL_FILTERS = [
  { key: "type", label: "Type", icon: <Tag size={16} /> },
  { key: "asset", label: "Asset", icon: <Network size={16} /> },
  { key: "location", label: "Location", icon: <MapPin size={16} /> },
];

export default function MetersFilterBar() {
  return (
    <FilterBar
      allFilters={ALL_FILTERS}
      defaultKeys={["type", "asset", "location"]}
    />
  );
}
