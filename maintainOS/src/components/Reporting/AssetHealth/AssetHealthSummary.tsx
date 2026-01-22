
import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { assetHealthService } from "./assetHealth.service";
import type { AssetHealthSummary as SummaryData } from "./assetHealth.types";

interface AssetHealthSummaryProps {
  dateRange: { startDate: string; endDate: string };
  onLoadingChange?: (isLoading: boolean) => void;
}

export function AssetHealthSummary({ dateRange, onLoadingChange }: AssetHealthSummaryProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assetHealthService.fetchSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch asset health summary:", err);
      setError("Failed to load summary data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-24 text-red-500">
          {error}
          <button onClick={fetchData} className="ml-2 text-amber-600 hover:text-amber-700">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const lastUpdatedFormatted = summary?.currentTime
    ? new Date(summary.currentTime).toLocaleString("en-US", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "N/A";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Changed Grid to Flex + divide-x for horizontal layout with separators */}
      <div className="flex flex-row items-center justify-between divide-x divide-gray-200">
        
        {/* Current Status */}
        <div className="flex items-center gap-3 pr-6">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 whitespace-nowrap">Current Status</div>
            <div className="text-xs text-gray-500">Last Updated:</div>
            <div className="text-xs text-gray-500 whitespace-nowrap">{lastUpdatedFormatted}</div>
          </div>
        </div>

        {/* Asset Availability */}
        <div className="flex-1 px-6">
          <div className="text-sm text-gray-500 mb-1 whitespace-nowrap">Asset Availability (30d)</div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500">→</span>
            <span className="text-xl font-semibold text-gray-900">
              {summary?.assetAvailability ?? 0}
            </span>
          </div>
        </div>

        {/* Online */}
        <div className="flex-1 px-6">
          <div className="text-sm text-gray-500 mb-1 whitespace-nowrap">Online</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xl font-semibold text-gray-900">
              {summary?.online ?? 0}
            </span>
          </div>
        </div>

        {/* Offline (Unplanned) */}
        <div className="flex-1 px-6">
          <div className="text-sm text-gray-500 mb-1 whitespace-nowrap">Offline (Unplanned)</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-xl font-semibold text-gray-900">
              {summary?.unplanned_offline ?? 0}
            </span>
          </div>
        </div>

        {/* Offline (Planned) */}
        <div className="flex-1 px-6">
          <div className="text-sm text-gray-500 mb-1 whitespace-nowrap">Offline (Planned)</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-xl font-semibold text-gray-900">
              {summary?.planned_offline ?? 0}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}