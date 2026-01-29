import { useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHART_DATA } from "../../../graphql/reporting.queries";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Info, ChevronRight, Plus, Loader2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { mapFilters } from "../filterUtils";

interface AvailabilityOverTimeChartProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
  onLoadingChange?: (isLoading: boolean) => void;
}

export function AvailabilityOverTimeChart({
  filters,
  dateRange,
  onLoadingChange,
}: AvailabilityOverTimeChartProps) {
  const apiFilters = useMemo(
    () => mapFilters(filters, dateRange),
    [filters, dateRange]
  );

  const { data, loading } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "ASSET_AVAILABILITY",
        groupByFields: ["date"],
        metric: "PERCENTAGE",
        filters: apiFilters,
        timeGranularity: "DAILY",
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

    return data.getChartData
      .map((item) => {
        const dateStr = item.groupValues[0];
        let formattedDate = dateStr;

        // Format date for display
        try {
          const dateValue = parseISO(dateStr);
          if (isValid(dateValue)) {
            formattedDate = format(dateValue, "d MMM");
          }
        } catch (e) {
          console.error("Date parsing error:", e, dateStr);
        }

        return {
          date: formattedDate,
          rawDate: dateStr,
          availability: item.value,
        };
      })
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate));
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
            Availability Over Time
          </CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
          <ChevronRight className="h-4 w-4 text-blue-500 cursor-pointer hover:bg-gray-100 rounded" />
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="pb-0 pt-0">
        <ResponsiveContainer width="100%" height={330}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
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
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              label={{
                value: "Percentage",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: "#666" },
              }}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}%`}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="availability"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{ r: 5, fill: "#60a5fa" }}
              activeDot={{ r: 7 }}
              name="Asset Availability"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 text-xs justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-400"></div>
            <span>Asset Availability</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
