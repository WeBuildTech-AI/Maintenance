import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AssetHealthSummary } from "./AssetHealthSummary";
import { ProblematicAssetsTable } from "./ProblematicAssetsTable";
import { UnplannedVsPlannedChart } from "./UnplannedVsPlannedChart";
import { DowntimeReasonsChart } from "./DowntimeReasonsChart";
import { AvailabilityOverTimeChart } from "./AvailabilityOverTimeChart";

interface AssetHealthTabProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
}

export function AssetHealthTab({ filters: _filters, dateRange }: AssetHealthTabProps) {
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
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          <span className="text-sm text-gray-500">Loading Asset Health...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Summary Cards */}
      <AssetHealthSummary dateRange={dateRange} />

      {/* Problematic Assets Table */}
      <ProblematicAssetsTable dateRange={dateRange} limit={10} />

      {/* Downtime Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnplannedVsPlannedChart filters={_filters} dateRange={dateRange} />
        <DowntimeReasonsChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AvailabilityOverTimeChart filters={_filters} dateRange={dateRange} />
      </div>
    </div>
  );
}
