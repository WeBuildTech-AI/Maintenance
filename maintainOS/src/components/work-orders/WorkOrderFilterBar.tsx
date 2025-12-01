import { User, MapPin, Tag, Settings, ClipboardCheck, ClipboardList, FileText, Repeat, Layers, Calendar, AlertCircle, Network, Share2, Wrench, Clock, Briefcase } from "lucide-react";
import FilterBar from "../utils/FilterBar";

// ✅ EXACT OPTIONS FROM SCREENSHOTS
const ALL_FILTERS = [
  // --- API FILTERS (Fetch data dynamically) ---
  { key: "asset", label: "Asset", icon: <Settings size={16} /> }, 
  { key: "location", label: "Location", icon: <MapPin size={16} /> },
  { key: "part", label: "Part", icon: <Settings size={16} /> },
  { key: "vendor", label: "Vendor", icon: <Network size={16} /> },
  { key: "category", label: "Category", icon: <Layers size={16} /> },
  { key: "assignedTo", label: "Assigned To", icon: <User size={16} /> },
  { key: "completedBy", label: "Completed By", icon: <User size={16} /> },
  { key: "requestedBy", label: "Requested By", icon: <User size={16} /> },
  { key: "procedure", label: "Procedure", icon: <Wrench size={16} /> },

  // --- HARDCODED FILTERS (Based on Screenshots) ---
  { 
    key: "status", 
    label: "Status", 
    icon: <Tag size={16} />,
    options: [
      { label: "Open", value: "open" },
      { label: "On Hold", value: "on_hold" },
      { label: "In Progress", value: "in_progress" }
    ]
  },
  { 
    key: "priority", 
    label: "Priority", 
    icon: <AlertCircle size={16} />,
    options: [
      { label: "None", value: "none" },
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" }
    ]
  },
  { 
    key: "parentSubWorkOrder", 
    label: "Parent/Sub-Work Order", 
    icon: <ClipboardCheck size={16} />,
    options: [
      { label: "Parent Work Order", value: "parent" },
      { label: "Sub-Work Order", value: "sub" },
      { label: "Neither Parent/Sub-Work Order", value: "neither" }
    ]
  },
  { 
    key: "sharedExported", 
    label: "Shared/Exported", 
    icon: <Share2 size={16} />,
    options: [
      { label: "Emailed to Vendor", value: "emailed" },
      { label: "Exported to PDF", value: "exported" }
    ]
  },
  { 
    key: "dueDate", 
    label: "Due Date", 
    icon: <Clock size={16} />,
    options: [
      { label: "Today", value: "today" },
      { label: "Tomorrow", value: "tomorrow" },
      { label: "Next 7 Days", value: "next7" },
      { label: "Next 30 Days", value: "next30" },
      { label: "This Month", value: "thisMonth" },
      { label: "Overdue", value: "overdue" },
      { label: "Custom Date", value: "custom" }
    ]
  },
  { 
    key: "workType", 
    label: "Work Type", 
    icon: <Briefcase size={16} />,
    options: [
      { label: "Reactive", value: "reactive" },
      { label: "Preventive", value: "preventive" },
      { label: "Other", value: "other" }
    ]
  },
  { 
    key: "startDate", 
    label: "Start Date", 
    icon: <Calendar size={16} />,
    options: [
      { label: "Today", value: "today" },
      { label: "Yesterday", value: "yesterday" },
      { label: "Last 7 Days", value: "last7" },
      { label: "Last 30 Days", value: "last30" },
      { label: "Custom Date", value: "custom" }
    ]
  },
  { 
    key: "recurrence", 
    label: "Recurrence", 
    icon: <Repeat size={16} />,
    hideCondition: true, // ✅ HIDDEN AS PER SCREENSHOT
    options: [
      { label: "Repeating", value: "repeating" },
      { label: "Non-Repeating", value: "non_repeating" }
    ]
  },
  { 
    key: "fromRequest", 
    label: "From a Request", 
    icon: <ClipboardList size={16} />,
    options: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" }
    ]
  },
  { key: "workOrderTemplate", label: "Work Order Template", icon: <FileText size={16} /> },
  { key: "assetTypes", label: "Asset Types", icon: <Layers size={16} /> },
];

interface WorkOrderFilterBarProps {
  onParamsChange?: (params: any) => void;
}

export default function WorkOrderFilterBar({ onParamsChange }: WorkOrderFilterBarProps) {
  return (
    <FilterBar
      allFilters={ALL_FILTERS}
      defaultKeys={[
        "asset",
        "status",
        "assignedTo"
      ]}
      onParamsChange={onParamsChange}
    />
  );
}