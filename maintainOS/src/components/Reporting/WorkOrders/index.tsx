import { CreatedVsCompletedChart } from "./CreatedVsCompletedChart";
import { WorkOrdersPriorityChart } from "./PriorityChart";
import { WorkOrdersStatusChart } from "./StatusChart";
import { WorkOrdersRepeatingChart } from "./Non-repeatingVsRepeatingChart";
import { WorkOrdersByTypeChart } from "./WorkOrdersByTypeChart";
import { TimeVsCostChart } from "./TimeVsCostChart";
import { TimeToCompleteChart } from "./TimeToCompleteChart";

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
  console.log("🎯 WorkOrdersTab received filters:", filters);
  console.log("🎯 WorkOrdersTab received dateRange:", dateRange);

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
    </div>
  );
}
