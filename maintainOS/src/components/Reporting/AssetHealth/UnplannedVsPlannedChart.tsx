import { useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHART_DATA } from "../../../graphql/reporting.queries";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Info, Plus, Loader2 } from "lucide-react";
import { mapFilters } from "../filterUtils";

interface UnplannedVsPlannedChartProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
  onLoadingChange?: (isLoading: boolean) => void;
}

export function UnplannedVsPlannedChart({
  filters,
  dateRange,
  onLoadingChange,
}: UnplannedVsPlannedChartProps) {
  const apiFilters = useMemo(
    () => mapFilters(filters, dateRange),
    [filters, dateRange]
  );

  const { data, loading } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "ASSET_DOWNTIME",
        groupByFields: ["assetId", "downtimeType"],
        metric: "SUM",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // Process data to group by asset
  const chartData = useMemo(() => {
    if (!data?.getChartData) return [];

    console.log("Raw GraphQL data:", data.getChartData);

    const assetMap = new Map<
      string,
      { asset: string; unplanned: number; planned: number; order: number }
    >();

    // Track the order in which assets appear (to preserve backend sorting)
    let orderIndex = 0;

    data.getChartData.forEach((item) => {
      const [assetName, downtimeType] = item.groupValues;
      console.log("Processing:", assetName, downtimeType, item.value);
      
      if (!assetName || assetName === "Unassigned") return;

      if (!assetMap.has(assetName)) {
        assetMap.set(assetName, { 
          asset: assetName, 
          unplanned: 0, 
          planned: 0,
          order: orderIndex++
        });
      }

      const entry = assetMap.get(assetName)!;
      // Sum values instead of overwriting (in case of duplicate entries from backend)
      if (downtimeType === "unplanned") {
        entry.unplanned += item.value;
        console.log("Added unplanned for", assetName, "value:", item.value, "new total:", entry.unplanned);
      } else if (downtimeType === "planned") {
        entry.planned += item.value;
        console.log("Added planned for", assetName, "value:", item.value, "new total:", entry.planned);
      }
    });

    // Return in the order received from backend (already sorted by unplanned downtime)
    const result = Array.from(assetMap.values())
      .sort((a, b) => a.order - b.order)
      .map(({ asset, unplanned, planned }) => ({ asset, unplanned, planned }));
    
    console.log("Final chartData:", result);
    return result;
  }, [data]);

  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Unplanned vs Planned Downtime
          </CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="pb-0 pt-0">
        <ResponsiveContainer width="100%" height={330}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="asset"
              tick={{ fontSize: 11 }}
              width={180}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}h`}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar dataKey="unplanned" fill="#f87171" radius={[0, 4, 4, 0]} />
            <Bar dataKey="planned" fill="#bfdbfe" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 text-xs justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-400"></div>
            <span>Unplanned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-200"></div>
            <span>Planned</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
