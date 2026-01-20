import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { CreatedVsCompletedChart } from "./CreatedVsCompletedChart";
import { WorkOrdersPriorityChart } from "./PriorityChart";
import { WorkOrdersStatusChart } from "./StatusChart";
import { WorkOrdersRepeatingChart } from "./Non-repeatingVsRepeatingChart";
import { WorkOrdersByTypeChart } from "./WorkOrdersByTypeChart";
import { TimeVsCostChart } from "./TimeVsCostChart";
import { TimeToCompleteChart } from "./TimeToCompleteChart";
import { InspectionCheckChart } from "./InspectionCheckChart";

interface WorkOrdersTabProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
  onNavigateToDetails?: (chartType: string) => void;
}

export function WorkOrdersTab({
  filters,
  dateRange,
  onNavigateToDetails,
}: WorkOrdersTabProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Brief loading state when tab mounts or date range changes
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [dateRange.startDate, dateRange.endDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <span className="text-sm text-gray-500">Loading Work Orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <CreatedVsCompletedChart
        filters={filters}
        dateRange={dateRange}
        onNavigateToDetails={() =>
          onNavigateToDetails?.("created-vs-completed")
        }
      />
      <WorkOrdersByTypeChart
        filters={filters}
        dateRange={dateRange}
        onNavigateToDetails={() => onNavigateToDetails?.("work-orders-by-type")}
      />
      <WorkOrdersRepeatingChart
        filters={filters}
        dateRange={dateRange}
        onNavigateToDetails={() =>
          onNavigateToDetails?.("non-repeating-vs-repeating")
        }
      />
      <WorkOrdersStatusChart
        filters={filters}
        dateRange={dateRange}
        onNavigateToDetails={() => onNavigateToDetails?.("status")}
      />
      <WorkOrdersPriorityChart
        filters={filters}
        dateRange={dateRange}
        onNavigateToDetails={() => onNavigateToDetails?.("priority")}
      />
      <TimeVsCostChart
        filters={filters}
        dateRange={dateRange}
        onNavigateToDetails={() => onNavigateToDetails?.("time-vs-cost")}
      />
      <TimeToCompleteChart
        filters={filters}
        dateRange={dateRange}
        onNavigateToDetails={() => onNavigateToDetails?.("time-to-complete")}
      />
      <InspectionCheckChart
        filters={filters}
        dateRange={dateRange}
        onNavigateToDetails={() => onNavigateToDetails?.("inspection-check")}
      />
    </div>
  );
}
