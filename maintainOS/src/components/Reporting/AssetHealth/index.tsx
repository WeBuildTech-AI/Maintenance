import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { AssetHealthSummary } from "./AssetHealthSummary";
import { ProblematicAssetsTable } from "./ProblematicAssetsTable";
import { UnplannedVsPlannedChart } from "./UnplannedVsPlannedChart";
import { DowntimeReasonsChart } from "./DowntimeReasonsChart";
import { AvailabilityOverTimeChart } from "./AvailabilityOverTimeChart";
import { TotalDowntimeChart } from "./TotalDowntimeChart";

interface AssetHealthTabProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
}

export function AssetHealthTab({ filters: _filters, dateRange }: AssetHealthTabProps) {
  // Track loading state for each component
  const [componentLoadingStates, setComponentLoadingStates] = useState<Record<string, boolean>>({
    summary: true,
    problematicAssets: true,
    unplannedVsPlanned: true,
    downtimeReasons: true,
    availabilityOverTime: true,
    totalDowntime: true,
  });

  // Callback to update individual component loading state
  const handleComponentLoadingChange = useCallback((componentId: string, isLoading: boolean) => {
    setComponentLoadingStates((prev) => ({
      ...prev,
      [componentId]: isLoading,
    }));
  }, []);

  // Check if any component is still loading
  const isAnyComponentLoading = Object.values(componentLoadingStates).some((loading) => loading);

  return (
    <div className="relative min-h-[600px]">
      {/* Loading Overlay */}
      {isAnyComponentLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            <span className="text-sm text-gray-500">Loading Asset Health Data...</span>
          </div>
        </div>
      )}

      {/* Components - always render but hide during loading */}
      <div className={`space-y-6 pb-6 ${isAnyComponentLoading ? 'hidden pointer-events-none' : 'animate-in fade-in duration-300'}`}>
        {/* Summary Cards */}
        <AssetHealthSummary
          dateRange={dateRange}
          onLoadingChange={(loading: boolean) => handleComponentLoadingChange("summary", loading)}
        />

        {/* Problematic Assets Table */}
        <ProblematicAssetsTable
          dateRange={dateRange}
          limit={10}
          onLoadingChange={(loading: boolean) => handleComponentLoadingChange("problematicAssets", loading)}
        />

        {/* Downtime Charts - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UnplannedVsPlannedChart
            filters={_filters}
            dateRange={dateRange}
            onLoadingChange={(loading: boolean) => handleComponentLoadingChange("unplannedVsPlanned", loading)}
          />
          <DowntimeReasonsChart
            onLoadingChange={(loading: boolean) => handleComponentLoadingChange("downtimeReasons", loading)}
          />
        </div>
        
        {/* Time Series Charts - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AvailabilityOverTimeChart
            filters={_filters}
            dateRange={dateRange}
            onLoadingChange={(loading: boolean) => handleComponentLoadingChange("availabilityOverTime", loading)}
          />
          <TotalDowntimeChart
            filters={_filters}
            dateRange={dateRange}
            onLoadingChange={(loading: boolean) => handleComponentLoadingChange("totalDowntime", loading)}
          />
        </div>
      </div>
    </div>
  );
}
