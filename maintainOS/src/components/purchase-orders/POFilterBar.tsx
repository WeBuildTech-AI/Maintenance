import { User, MapPin, Tag, Settings, ClipboardCheck } from "lucide-react";
import FilterBar from "../utils/FilterBar";

const ALL_FILTERS = [
  { key: "vendor", label: "Vendor", icon: <Settings size={16} /> },
  { 
    key: "status", 
    label: "Status", 
    icon: <Tag size={16} />,
    options: [
      { label: "Draft", value: "draft" },
      { label: "Pending Approval", value: "pending_approval" },
      { label: "Approved", value: "approved" },
      { label: "Rejected", value: "rejected" },
      { label: "Ordered", value: "ordered" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" }
    ]
  },
  { key: "part", label: "Part", icon: <Settings size={16} /> },
  { key: "shipping", label: "Shipping Address", icon: <MapPin size={16} /> },
  { key: "assigned", label: "Assigned To", icon: <User size={16} /> },
  { key: "billing", label: "Billing Address", icon: <MapPin size={16} /> },
  { key: "createdBy", label: "Created By", icon: <User size={16} /> },
];

interface POFilterBarProps {
  onParamsChange?: (params: any) => void;
}

export default function POFilterBar({ onParamsChange }: POFilterBarProps) {
  return (
    <FilterBar
      allFilters={ALL_FILTERS}
      defaultKeys={["vendor", "status"]}
      onParamsChange={onParamsChange}
    />
  );
}