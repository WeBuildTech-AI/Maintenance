import { User, MapPin, Tag, Settings, ClipboardCheck, ClipboardList, FileText, Repeat, Layers, Calendar, AlertCircle, Network, Share2, Wrench, Hash, CheckSquare, Clock, Briefcase } from "lucide-react";
import FilterBar from "../utils/FilterBar";

const ALL_FILTERS = [
  { key: "asset", label: "Asset", icon: <Settings size={16} /> },
  { key: "assetStatus", label: "Asset Status", icon: <Tag size={16} /> },
  { key: "assetTypes", label: "Asset Types", icon: <Layers size={16} /> },
  { key: "completedBy", label: "Completed By", icon: <User size={16} /> },
  { key: "fromRequest", label: "From a Request", icon: <ClipboardList size={16} /> },
  { key: "sharedExternally", label: "Shared Externally", icon: <Share2 size={16} /> },
  { key: "part", label: "Part", icon: <Settings size={16} /> },
  { key: "parentSubWorkOrder", label: "Parent/Sub-Work Order", icon: <ClipboardCheck size={16} /> },
  { key: "procedure", label: "Procedure", icon: <Wrench size={16} /> },
  { key: "requestedBy", label: "Requested By", icon: <User size={16} /> },
  { key: "sharedExported", label: "Shared/Exported", icon: <Share2 size={16} /> },
  { key: "status", label: "Status", icon: <Tag size={16} /> },
  { key: "category", label: "Category", icon: <Layers size={16} /> },
  { key: "recurrence", label: "Recurrence", icon: <Repeat size={16} /> },
  { key: "vendor", label: "Vendor", icon: <Network size={16} /> },
  { key: "workOrderTemplate", label: "Work Order Template", icon: <FileText size={16} /> },
  { key: "workType", label: "Work Type", icon: <Briefcase size={16} /> },
  { key: "startDate", label: "Start Date", icon: <Calendar size={16} /> },
  { key: "assignedTo", label: "Assigned To", icon: <User size={16} /> },
  { key: "dueDate", label: "Due Date", icon: <Clock size={16} /> },
  { key: "location", label: "Location", icon: <MapPin size={16} /> },
  { key: "priority", label: "Priority", icon: <AlertCircle size={16} /> },
];

export default function WorkOrderFilterBar() {
  return (
    <FilterBar
      allFilters={ALL_FILTERS}
      defaultKeys={[
        "asset",
        "status",
        "assignedTo"
      ]}
    />
  );
}
