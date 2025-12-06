import { useMemo } from "react";
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

interface WorkOrdersByTypeChartProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
}

export function WorkOrdersByTypeChart({
  filters,
  dateRange,
}: WorkOrdersByTypeChartProps) {
  const apiFilters = useMemo(() => {
    const mapped = mapFilters(filters, dateRange);
    console.log("📊 Filters:", filters);
    console.log("📊 Date range:", dateRange);
    console.log("📊 Mapped Filters:", mapped);
    return mapped;
  }, [filters, dateRange]);

  const { data: workTypeData, loading: workTypeLoading } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "WORK_ORDERS",
        groupByFields: ["workType"],
        metric: "COUNT",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const { data: workTypeByDateData } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "WORK_ORDERS",
        groupByFields: ["createdAt", "workType"],
        metric: "COUNT",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const stats = useMemo(() => {
    if (!workTypeData?.getChartData)
      return { preventive: 0, reactive: 0, other: 0, preventiveRatio: 0 };

    const rows = workTypeData.getChartData;
    const preventive =
      rows.find((r: any) => r.groupValues?.[0]?.toLowerCase() === "preventive")
        ?.value || 0;
    const reactive =
      rows.find((r: any) => r.groupValues?.[0]?.toLowerCase() === "reactive")
        ?.value || 0;
    const other =
      rows.find((r: any) => r.groupValues?.[0]?.toLowerCase() === "other")
        ?.value || 0;

    const total = preventive + reactive + other;
    const preventiveRatio =
      total > 0 ? ((preventive / total) * 100).toFixed(1) : 0;

    return { preventive, reactive, other, preventiveRatio };
  }, [workTypeData]);

  const chartData = useMemo(() => {
    if (!workTypeByDateData?.getChartData) return [];

    const dateMap = new Map<
      string,
      { preventive: number; reactive: number; other: number }
    >();

    workTypeByDateData.getChartData.forEach((item: any) => {
      const [dateLabel, workType] = item.groupValues || [];
      if (dateLabel && dateLabel !== "Unassigned" && workType) {
        if (!dateMap.has(dateLabel)) {
          dateMap.set(dateLabel, { preventive: 0, reactive: 0, other: 0 });
        }
        const entry = dateMap.get(dateLabel)!;
        const workTypeLower = workType.toLowerCase();

        if (workTypeLower === "preventive") {
          entry.preventive = item.value;
        } else if (workTypeLower === "reactive") {
          entry.reactive = item.value;
        } else if (workTypeLower === "other") {
          entry.other = item.value;
        }
      }
    });

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, data]) => {
        let formattedDate = dateStr;
        try {
          const dateObj = parseISO(dateStr);
          if (isValid(dateObj)) {
            formattedDate = format(dateObj, "MMM dd");
          }
        } catch (e) {}

        return {
          date: formattedDate,
          ...data,
        };
      });
  }, [workTypeByDateData]);

  if (workTypeLoading) {
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
            Work Orders by Type
          </CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
          <ChevronRight className="h-4 w-4 text-blue-500" />
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {/* --- FIXED STATS LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 text-center max-w-4xl mx-auto py-12">
          {/* Preventive */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold">{stats.preventive}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-teal-600 border-teal-300 hover:bg-teal-50"
            >
              Preventive
            </Button>
          </div>

          {/* Reactive */}
          <div className="flex flex-col items-center">
            <div className="text-7xl font-bold">{stats.reactive}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Reactive
            </Button>
          </div>

          {/* Other */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold">{stats.other}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Other
            </Button>
          </div>

          {/* Ratio */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold flex items-baseline">
              {stats.preventiveRatio}
              <span className="text-xl ml-1">%</span>
            </div>
            <div className="mt-2 text-sm text-gray-600 font-medium">
              Total Preventive Ratio
            </div>
          </div>
        </div>

        {/* CHART */}
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
            <Tooltip />
            <Legend />
            <Bar
              dataKey="preventive"
              fill="#14b8a6"
              name="Preventive"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="reactive"
              fill="#3b82f6"
              name="Reactive"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="other"
              fill="#9ca3af"
              name="Other"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
