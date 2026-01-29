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

interface CreatedVsCompletedChartProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
  onNavigateToDetails?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function CreatedVsCompletedChart({
  filters,
  dateRange,
  onNavigateToDetails,
  onLoadingChange,
}: CreatedVsCompletedChartProps) {
  const apiFilters = useMemo(() => {
    const mapped = mapFilters(filters, dateRange);
    return mapped;
  }, [filters, dateRange]);

  // 1. Fetch Status Counts (For Big Numbers)
  const { data: statusData, loading: statusLoading } = useQuery<{
    getChartData?: { groupValues: string[]; value: number }[];
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "WORK_ORDERS",
        groupByFields: ["status"],
        metric: "COUNT",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(statusLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusLoading]); // Only depend on statusLoading, not onLoadingChange

  // 2. Fetch Created By Date (For Blue Line)
  const {
    data: createdData,
  }: { data?: { getChartData?: { groupValues: string[]; value: number }[] } } =
    useQuery(GET_CHART_DATA, {
      variables: {
        input: {
          dataset: "WORK_ORDERS",
          groupByFields: ["createdAt"],
          metric: "COUNT",
          filters: apiFilters,
        },
      },
      fetchPolicy: "cache-and-network",
    });

  // 3. Fetch Completed By Date (For Green Line)
  const {
    data: completedData,
  }: { data?: { getChartData?: { groupValues: string[]; value: number }[] } } =
    useQuery(GET_CHART_DATA, {
      variables: {
        input: {
          dataset: "WORK_ORDERS",
          groupByFields: ["completedAt"],
          metric: "COUNT",
          filters: apiFilters,
        },
      },
      fetchPolicy: "cache-and-network",
    });

  // --- Calculations ---

  // Calculate Totals
  const stats = useMemo(() => {
    if (!statusData?.getChartData)
      return { created: 0, completed: 0, percent: 0 };

    const rows = statusData.getChartData;
    // Total Created = Sum of all items returned
    const totalCreated = rows.reduce(
      (acc: number, curr: any) => acc + curr.value,
      0
    );

    // Total Completed = Only those with status 'COMPLETED' (Adjust string based on your DB enum)
    const totalCompleted =
      rows.find(
        (r: any) =>
          r.groupValues?.[0] === "COMPLETED" || r.groupValues?.[0] === "done"
      )?.value || 0;

    return {
      created: totalCreated,
      completed: totalCompleted,
      percent:
        totalCreated > 0
          ? ((totalCompleted / totalCreated) * 100).toFixed(1)
          : 0,
    };
  }, [statusData]);

  // Merge Data for Chart
  const chartData = useMemo(() => {
    const createdMap = new Map();
    const completedMap = new Map();
    const allDates = new Set<string>();

    // Process Created
    createdData?.getChartData?.forEach((item: any) => {
      // Backend returns date string, e.g., "2025-10-01"
      const dateLabel = item.groupValues?.[0];
      if (dateLabel && dateLabel !== "Unassigned") {
        createdMap.set(dateLabel, item.value);
        allDates.add(dateLabel);
      }
    });

    // Process Completed
    completedData?.getChartData?.forEach((item: any) => {
      const dateLabel = item.groupValues?.[0];
      if (dateLabel && dateLabel !== "Unassigned") {
        completedMap.set(dateLabel, item.value);
        allDates.add(dateLabel);
      }
    });

    // Sort dates and build array
    return Array.from(allDates)
      .sort()
      .map((dateStr) => {
        let formattedDate = dateStr;
        // Formatting date for prettier display (e.g., "Oct 01")
        try {
          // Handle both ISO date strings and timestamps
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
          created: createdMap.get(dateStr) || 0,
          completed: completedMap.get(dateStr) || 0,
        };
      });
  }, [createdData, completedData]);

  if (statusLoading) {
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
            Created vs. Completed
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
            <div className="text-5xl font-bold mb-3">{stats.created}</div>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Created
            </Button>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">{stats.completed}</div>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              Completed
            </Button>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">
              {stats.percent}
              <span className="text-3xl">%</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">Percent Completed</div>
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
              dataKey="created"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Created"
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
