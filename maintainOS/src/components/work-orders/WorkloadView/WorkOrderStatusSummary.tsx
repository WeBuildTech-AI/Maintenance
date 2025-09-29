import {
  AlertTriangle,
  CalendarClock,
  CircleDot,
  Clock,
  Info,
  Loader,
  PauseCircle,
} from "lucide-react";
import React from "react";

/* ------------------------------- Types ------------------------------- */
interface StatusCounts {
  overdue: number;
  dueSoon: number;
  open: number;
  onHold: number;
  inProgress: number;
}

interface WorkOrderStatusSummaryProps {
  unscheduledCount: number;
  statusCounts: StatusCounts;
  onStatusClick?: (status: string) => void;
}

/* ----------------------------- Status Card ----------------------------- */
const StatusCard = ({
  label,
  count,
  icon,
  color,
  onClick,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className="cursor-pointer border border-gray-200 rounded-lg p-3 bg-white flex-1 min-w-[100px] hover:shadow-sm transition-shadow"
  >
    <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
    <div className="flex items-center gap-1.5">
      <span className={`${color} flex items-center`}>{icon}</span>
      <span className="font-semibold text-lg">{count}</span>
    </div>
  </div>
);

/* ------------------------- Main Component ------------------------- */
export default function WorkOrderStatusSummary({
  unscheduledCount = 33,
  statusCounts = {
    overdue: 3,
    dueSoon: 24,
    open: 0,
    onHold: 5,
    inProgress: 1,
  },
  onStatusClick = () => {},
}: WorkOrderStatusSummaryProps) {
  const topRowStatuses = [
    { label: "Overdue", count: statusCounts.overdue, icon: <Clock size={16} />, color: "text-red-500" },
    { label: "Due Soon", count: statusCounts.dueSoon, icon: <CalendarClock size={16} />, color: "text-gray-600" },
    { label: "Open", count: statusCounts.open, icon: <CircleDot size={16} />, color: "text-blue-500" },
    { label: "On Hold", count: statusCounts.onHold, icon: <PauseCircle size={16} />, color: "text-yellow-500" },
  ];

  const bottomRowStatus = {
    label: "In Progress",
    count: statusCounts.inProgress,
    icon: <Loader size={16} />,
    color: "text-green-500"
  };

  return (
    <div className=" border  rounded-lg p-4 mb-4">
      <div className="flex gap-6 items-start">
        {/* Left section - Warning */}
        <div className="flex items-start gap-3 min-w-[320px] flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm">
                Unscheduled Work Orders ({unscheduledCount})
              </span>
              <Info className="h-4 w-4 text-gray-400 cursor-pointer flex-shrink-0" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Review Work Orders that aren't visible on the Workload view.
            </p>
          </div>
        </div>

        {/* Right section - Status cards */}
        <div className="flex-1">
          {/* Top row - 4 cards */}
          <div className="flex gap-3 mb-3">
            {topRowStatuses.map((status) => (
              <StatusCard
                key={status.label}
                label={status.label}
                count={status.count}
                icon={status.icon}
                color={status.color}
                onClick={() => onStatusClick(status.label)}
              />
            ))}
          </div>
          
          {/* Bottom row - 1 card aligned to start with same width */}
          <div className="flex">
            <div style={{ width: 'calc(25% - 9px)' }}>
              <StatusCard
                label={bottomRowStatus.label}
                count={bottomRowStatus.count}
                icon={bottomRowStatus.icon}
                color={bottomRowStatus.color}
                onClick={() => onStatusClick(bottomRowStatus.label)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}