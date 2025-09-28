import { User, MapPin, Tag, Settings } from "lucide-react";
import FilterBar from "../utils/FilterBar";

const ALL_FILTERS = [
  { key: "vendor", label: "Vendor", icon: <Settings size={16} /> },
  { key: "status", label: "Status", icon: <Tag size={16} /> },
  { key: "part", label: "Part", icon: <Settings size={16} /> },
  { key: "shipping", label: "Shipping Address", icon: <MapPin size={16} /> },
  { key: "assigned", label: "Assigned To", icon: <User size={16} /> },
  { key: "billing", label: "Billing Address", icon: <MapPin size={16} /> },
  { key: "createdBy", label: "Created By", icon: <User size={16} /> },
];

export default function MessagesFilterBar() {
  return (
    <FilterBar
      allFilters={ALL_FILTERS}
      defaultKeys={["vendor", "status", "part"]}
    />
  );
}
