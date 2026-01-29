import { useMemo, useState, useEffect } from "react";
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
  Legend,
} from "recharts";
import { Info, ChevronRight, Plus, Loader2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { mapFilters } from "../filterUtils";

interface TimeVsCostChartProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
  onNavigateToDetails?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

type ViewMode = "time" | "cost";

export function TimeVsCostChart({
  filters,
  dateRange,
  onNavigateToDetails,
  onLoadingChange,
}: TimeVsCostChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("cost");

  const apiFilters = useMemo(() => {
    return mapFilters(filters, dateRange);
  }, [filters, dateRange]);

  // Fetch time and cost data by date
  const { data, loading } = useQuery<{
    getChartData: Array<{
      groupValues: string[];
      totalTimeMinutes?: number;
      totalCost?: number;
    }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "TIME_COST",
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

  // Calculate totals
  const totals = useMemo(() => {
    if (!data?.getChartData) {
      return { totalTimeMinutes: 0, totalCost: 0, totalHours: 0 };
    }

    const totalTimeMinutes = data.getChartData.reduce(
      (sum, item) => sum + (item.totalTimeMinutes || 0),
      0
    );
    const totalCost = data.getChartData.reduce(
      (sum, item) => sum + (item.totalCost || 0),
      0
    );
    const totalHours = totalTimeMinutes / 60;

    return { totalTimeMinutes, totalCost, totalHours };
  }, [data]);

  // Process chart data
  const chartData = useMemo(() => {
    if (!data?.getChartData) return [];

    const dateMap = new Map<
      string,
      { timeMinutes: number; cost: number; timeHours: number }
    >();

    data.getChartData.forEach((item) => {
      const [dateLabel] = item.groupValues || [];
      if (!dateLabel || dateLabel === "Unassigned") return;

      if (!dateMap.has(dateLabel)) {
        dateMap.set(dateLabel, { timeMinutes: 0, cost: 0, timeHours: 0 });
      }

      const entry = dateMap.get(dateLabel)!;
      entry.timeMinutes += item.totalTimeMinutes || 0;
      entry.cost += item.totalCost || 0;
      entry.timeHours = entry.timeMinutes / 60;
    });

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, data]) => {
        let formatted = dateStr;
        try {
          const dateValue = !isNaN(Number(dateStr))
            ? new Date(Number(dateStr))
            : parseISO(dateStr);
          if (isValid(dateValue)) {
            formatted = format(dateValue, "MMM dd");
          }
        } catch (e) {
          console.error("Date parsing error:", e, dateStr);
        }

        return {
          date: formatted,
          timeHours: Math.round(data.timeHours * 10) / 10,
          cost: Math.round(data.cost),
        };
      });
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
            Time vs. Cost Reports
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
        <div className="grid grid-cols-2 gap-8 mb-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">
              {totals.totalHours.toFixed(1)}
              <span className="text-3xl">h</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Total Reported Time Spent
            </Button>
          </div>

          <div className="text-center">
            <div className="text-5xl font-bold mb-3">
              ₹{Math.round(totals.totalCost)}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Total Reported Cost Spent
            </Button>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === "Time (hours)") return [`${value}h`, "Time"];
                if (name === "Cost (₹)") return [`₹${value}`, "Cost"];

                return value;
              }}
            />
            <Legend />
            <Bar
              key="time-cost-bar"
              dataKey={viewMode === "time" ? "timeHours" : "cost"}
              fill="#3b82f6"
              name={viewMode === "time" ? "Time (hours)" : "Cost (₹)"}

              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Toggle Buttons */}
        {/* <div className="flex justify-center gap-2 mt-4">
          <Button
            variant={viewMode === "time" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("time")}
            className={
              viewMode === "time"
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : ""
            }
          >
            Time Reported
          </Button>
          <Button
            variant={viewMode === "cost" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cost")}
            className={
              viewMode === "cost"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : ""
            }
          >
            Cost Reported
          </Button>
        </div> */}
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("time")}
            className={
              viewMode === "time"
                ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                : "text-gray-600 hover:bg-gray-100"
            }
          >
            Time Reported
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("cost")}
            className={
              viewMode === "cost"
                ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                : "text-gray-600 hover:bg-gray-100"
            }
          >
            Cost Reported
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
