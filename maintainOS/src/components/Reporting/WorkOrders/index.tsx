import { useState, useCallback } from "react";
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
  // Track loading state for each chart
  const [chartLoadingStates, setChartLoadingStates] = useState<Record<string, boolean>>({
    createdVsCompleted: true,
    workOrdersByType: true,
    repeating: true,
    status: true,
    priority: true,
    timeVsCost: true,
    timeToComplete: true,
    inspectionCheck: true,
  });

  // Callback to update individual chart loading state
  const handleChartLoadingChange = useCallback((chartId: string, isLoading: boolean) => {
    setChartLoadingStates((prev) => ({
      ...prev,
      [chartId]: isLoading,
    }));
  }, []);

  // Check if any chart is still loading
  const isAnyChartLoading = Object.values(chartLoadingStates).some((loading) => loading);

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isAnyChartLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <span className="text-sm text-gray-500">Loading Work Order Data</span>
          </div>
        </div>
      )}

      {/* Charts - render in background while loading */}
      <div className={`space-y-6 pb-6 ${isAnyChartLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <CreatedVsCompletedChart
          filters={filters}
          dateRange={dateRange}
          onNavigateToDetails={() =>
            onNavigateToDetails?.("created-vs-completed")
          }
          onLoadingChange={(loading) => handleChartLoadingChange("createdVsCompleted", loading)}
        />
        <WorkOrdersByTypeChart
          filters={filters}
          dateRange={dateRange}
          onNavigateToDetails={() => onNavigateToDetails?.("work-orders-by-type")}
          onLoadingChange={(loading) => handleChartLoadingChange("workOrdersByType", loading)}
        />
        <WorkOrdersRepeatingChart
          filters={filters}
          dateRange={dateRange}
          onNavigateToDetails={() =>
            onNavigateToDetails?.("non-repeating-vs-repeating")
          }
          onLoadingChange={(loading) => handleChartLoadingChange("repeating", loading)}
        />
        <WorkOrdersStatusChart
          filters={filters}
          dateRange={dateRange}
          onNavigateToDetails={() => onNavigateToDetails?.("status")}
          onLoadingChange={(loading) => handleChartLoadingChange("status", loading)}
        />
        <WorkOrdersPriorityChart
          filters={filters}
          dateRange={dateRange}
          onNavigateToDetails={() => onNavigateToDetails?.("priority")}
          onLoadingChange={(loading) => handleChartLoadingChange("priority", loading)}
        />
        <TimeVsCostChart
          filters={filters}
          dateRange={dateRange}
          onNavigateToDetails={() => onNavigateToDetails?.("time-vs-cost")}
          onLoadingChange={(loading) => handleChartLoadingChange("timeVsCost", loading)}
        />
        <TimeToCompleteChart
          filters={filters}
          dateRange={dateRange}
          onNavigateToDetails={() => onNavigateToDetails?.("time-to-complete")}
          onLoadingChange={(loading) => handleChartLoadingChange("timeToComplete", loading)}
        />
        <InspectionCheckChart
          filters={filters}
          dateRange={dateRange}
          onNavigateToDetails={() => onNavigateToDetails?.("inspection-check")}
          onLoadingChange={(loading) => handleChartLoadingChange("inspectionCheck", loading)}
        />
      </div>
    </div>
  );
}
