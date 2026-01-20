import { User, MapPin, AlertCircle, Calendar, Briefcase, Activity } from "lucide-react";
import FilterBar from "../utils/FilterBar";

const ALL_FILTERS = [
  // --- API FILTERS (Fetch data dynamically) ---
  {
    key: "assignedTo",
    label: "Assigned To",
    icon: <User size={16} />,
  },
  {
    key: "location",
    label: "Location",
    icon: <MapPin size={16} />,
  },

  // --- HARDCODED FILTERS ---
  {
    key: "dueDate",
    label: "Due Date",
    icon: <Calendar size={16} />,
    options: [
      { label: "Today", value: "today" },
      { label: "Tomorrow", value: "tomorrow" },
      { label: "Next 7 Days", value: "next7" },
      { label: "Next 30 Days", value: "next30" },
      { label: "This Month", value: "thisMonth" },
      { label: "Overdue", value: "overdue" },
      { label: "Custom Date", value: "custom" },
    ],
  },
  {
    key: "priority",
    label: "Priority",
    icon: <AlertCircle size={16} />,
    options: [
      { label: "None", value: "none" },
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
    ],
  },
  {
    key: "workType",
    label: "Work Type",
    icon: <Briefcase size={16} />,
    options: [
      { label: "Reactive", value: "reactive" },
      { label: "Preventive", value: "preventive" },
      { label: "Other", value: "other" },
    ],
  },
  // --- ASSET HEALTH SPECIFIC FILTERS ---
  {
    key: "criticality",
    label: "Criticality",
    icon: <AlertCircle size={16} />,
    options: [
      { label: "High", value: "high" },
      { label: "Medium", value: "medium" },
      { label: "Low", value: "low" },
    ],
  },
  {
    key: "downtimeReason",
    label: "Downtime Reason",
    icon: <Activity size={16} />,
  },
  {
    key: "downtimeType",
    label: "Downtime Type",
    icon: <Activity size={16} />,
    options: [
      { label: "Planned", value: "planned" },
      { label: "Unplanned", value: "unplanned" },
    ],
  },
  {
    key: "assetTypes",
    label: "Asset Types",
    icon: <Briefcase size={16} />,
  },
  // --- NEW FILTERS WITH ICONS ---
  {
    key: "assetStatus",
    label: "Asset Status",
    icon: <Briefcase size={16} />,
  },
  {
    key: "completedBy",
    label: "Completed By",
    icon: <User size={16} />,
  },
  {
    key: "fromRequest",
    label: "From a Request",
    icon: <AlertCircle size={16} />,
  },
  {
    key: "sharedExternally",
    label: "Shared Externally",
    icon: <MapPin size={16} />,
  },
  {
    key: "part",
    label: "Part",
    icon: <Briefcase size={16} />,
  },
  {
    key: "parentSubWorkOrder",
    label: "Parent/Sub-Work Order",
    icon: <Calendar size={16} />,
  },
  {
    key: "procedure",
    label: "Procedure",
    icon: <AlertCircle size={16} />,
  },
  {
    key: "procedureFlags",
    label: "Procedure Flags",
    icon: <Briefcase size={16} />,
  },
  {
    key: "requestedBy",
    label: "Requested By",
    icon: <User size={16} />,
  },
  {
    key: "sharedExported",
    label: "Shared/Exported",
    icon: <MapPin size={16} />,
  },
  {
    key: "status",
    label: "Status",
    icon: <AlertCircle size={16} />,
  },
  {
    key: "category",
    label: "Category",
    icon: <Briefcase size={16} />,
  },
  {
    key: "title",
    label: "Title",
    icon: <Calendar size={16} />,
  },
  {
    key: "recurrence",
    label: "Recurrence",
    icon: <AlertCircle size={16} />,
  },
  {
    key: "vendor",
    label: "Vendor",
    icon: <User size={16} />,
  },
  {
    key: "workOrderTemplate",
    label: "Work Order Template",
    icon: <Briefcase size={16} />,
  },
  {
    key: "startDate",
    label: "Start Date",
    icon: <Calendar size={16} />,
  },
];

interface ReportingFilterBarProps {
  onParamsChange?: (params: any) => void;
  activeTab?: string;
}

export default function ReportingFilterBar({
  onParamsChange,
  activeTab = "work-orders",
}: ReportingFilterBarProps) {
  // Different default filters based on active tab
  const getDefaultKeys = () => {
    if (activeTab === "asset-health") {
      return ["criticality", "status", "downtimeReason", "downtimeType", "assetTypes"];
    }
    // Default for work-orders and other tabs
    return ["assignedTo", "dueDate", "location", "priority"];
  };

  return (
    <FilterBar
      key={activeTab} // Force re-render when tab changes
      allFilters={ALL_FILTERS}
      defaultKeys={getDefaultKeys()}
      onParamsChange={onParamsChange}
    />
  );
}
