import { useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHART_DATA } from "../../../graphql/reporting.queries";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Info, ChevronRight, Plus, Loader2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { mapFilters } from "../filterUtils";

interface TotalDowntimeChartProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
  onLoadingChange?: (isLoading: boolean) => void;
}

export function TotalDowntimeChart({
  filters,
  dateRange,
  onLoadingChange,
}: TotalDowntimeChartProps) {
  const apiFilters = useMemo(
    () => mapFilters(filters, dateRange),
    [filters, dateRange]
  );

  const { data, loading } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "TOTAL_DOWNTIME_OVER_TIME",
        groupByFields: ["date", "downtimeType"],
        metric: "SUM",
        filters: apiFilters,
        timeGranularity: "WEEKLY",
      },
    },
    fetchPolicy: "cache-and-network",
  });

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(loading);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]); // Only depend on loading state, not onLoadingChange

  // Process data for chart
  const chartData = useMemo(() => {
    if (!data?.getChartData) return [];

    // Group by date
    const dateMap = new Map<
      string,
      { date: string; rawDate: string; planned: number; unplanned: number; total: number }
    >();

    data.getChartData.forEach((item) => {
      const [dateStr, downtimeType] = item.groupValues;
      
      if (!dateMap.has(dateStr)) {
        let formattedDate = dateStr;
        try {
          const dateValue = parseISO(dateStr);
          if (isValid(dateValue)) {
            formattedDate = format(dateValue, "d MMM");
          }
        } catch (e) {
          console.error("Date parsing error:", e, dateStr);
        }

        dateMap.set(dateStr, {
          date: formattedDate,
          rawDate: dateStr,
          planned: 0,
          unplanned: 0,
          total: 0,
        });
      }

      const entry = dateMap.get(dateStr)!;
      if (downtimeType === "planned") {
        entry.planned = item.value;
      } else if (downtimeType === "unplanned") {
        entry.unplanned = item.value;
      }
      entry.total = entry.planned + entry.unplanned;
    });

    return Array.from(dateMap.values()).sort((a, b) =>
      a.rawDate.localeCompare(b.rawDate)
    );
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
            Total Downtime
          </CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
          <ChevronRight className="h-4 w-4 text-blue-500 cursor-pointer hover:bg-gray-100 rounded" />
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="pb-0 pt-0 ">
        <ResponsiveContainer width="100%" height={330}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorUnplanned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={0}
              textAnchor="middle"
              height={40}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: "Hours",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: "#666" },
              }}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}h`}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="planned"
              stroke="#60a5fa"
              strokeWidth={2}
              fill="url(#colorPlanned)"
              dot={{ r: 4, fill: "#60a5fa" }}
            />
            <Area
              type="monotone"
              dataKey="unplanned"
              stroke="#f87171"
              strokeWidth={2}
              fill="url(#colorUnplanned)"
              dot={{ r: 4, fill: "#f87171" }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 text-xs justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-400"></div>
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-400"></div>
            <span>Unplanned</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
