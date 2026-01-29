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
  Legend,
} from "recharts";
import { Info, ChevronRight, Plus, Loader2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { mapFilters } from "../filterUtils";

interface TimeToCompleteChartProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
  onNavigateToDetails?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function TimeToCompleteChart({
  filters,
  dateRange,
  onNavigateToDetails,
  onLoadingChange,
}: TimeToCompleteChartProps) {
  const apiFilters = useMemo(() => {
    return mapFilters(filters, dateRange);
  }, [filters, dateRange]);

  // Fetch time to complete data
  const { data, loading } = useQuery<{
    getChartData?: {
      groupValues: string[];
      value: number;
      mttrAvgHours?: number;
    }[];
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "TIME_TO_COMPLETE",
        groupByFields: ["createdAt"],
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(loading);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]); // Only depend on loading state, not onLoadingChange

  // Calculate stats
  const stats = useMemo(() => {
    if (!data?.getChartData || data.getChartData.length === 0) {
      return { totalHours: 0, avgHours: 0, mttrAvgHours: 0 };
    }

    const items = data.getChartData;
    const totalHours = items.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const avgHours = totalHours / items.length;

    // Calculate MTTR average from items that have mttrAvgHours
    const mttrItems = items.filter(
      (item) => item.mttrAvgHours !== undefined && item.mttrAvgHours !== null
    );
    const mttrAvgHours =
      mttrItems.length > 0
        ? mttrItems.reduce((acc, curr) => acc + (curr.mttrAvgHours || 0), 0) /
          mttrItems.length
        : 0;

    return {
      totalHours: Math.round(totalHours),
      avgHours: Number(avgHours.toFixed(1)),
      mttrAvgHours: Number(mttrAvgHours.toFixed(1)),
    };
  }, [data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data?.getChartData) return [];

    return data.getChartData
      .filter((item) => {
        const dateLabel = item.groupValues?.[0];
        return dateLabel && dateLabel !== "Unassigned";
      })
      .map((item) => {
        const dateStr = item.groupValues?.[0] || "";
        let formattedDate = dateStr;

        try {
          const dateValue = !isNaN(Number(dateStr))
            ? new Date(Number(dateStr))
            : parseISO(dateStr);
          if (isValid(dateValue)) {
            formattedDate = format(dateValue, "MMM dd");
          }
        } catch (e) {
          console.error("Date parsing error:", e, dateStr);
        }

        return {
          date: formattedDate,
          rawDate: dateStr,
          mttrAvgHours: item.mttrAvgHours || 0,
        };
      })
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  }, [data]);

  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Time to Complete
          </CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
          <button
            onClick={onNavigateToDetails}
            className="hover:bg-gray-100 rounded p-1 transition-colors"
            title="View details"
          >
            <ChevronRight className="h-4 w-4 text-blue-500" />
          </button>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mb-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">
              {stats.totalHours}
              <span className="text-3xl ml-1">h</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Total Hours
            </Button>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">
              {stats.avgHours}
              <span className="text-3xl ml-1">h</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-teal-600 border-teal-300 hover:bg-teal-50"
            >
              AVG Hours
            </Button>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">
              {stats.mttrAvgHours}
              <span className="text-3xl ml-1">h</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              MTTR AVG Hours
            </Button>
            <div className="text-xs text-gray-500 mt-2">
              Only on Non-Repeating
              <br />
              Work Orders
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="mttrAvgHours"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="MTTR AVG Hours"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
