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
  Legend,
} from "recharts";
import { Info, ChevronRight, Plus, Loader2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { mapFilters } from "../filterUtils";

interface Props {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
  onNavigateToDetails?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function WorkOrdersRepeatingChart({
  filters,
  dateRange,
  onNavigateToDetails,
  onLoadingChange,
}: Props) {
  const apiFilters = useMemo(() => {
    return mapFilters(filters, dateRange);
  }, [filters, dateRange]);

  // 1️⃣ STATS QUERY (REPEATING / NON-REPEATING)
  const { data: repeatingStatsData, loading: repeatingStatsLoading } =
    useQuery<{
      getChartData: Array<{ groupValues: string[]; value: number }>;
    }>(GET_CHART_DATA, {
      variables: {
        input: {
          dataset: "WORK_ORDERS",
          groupByFields: ["repeatingType"],
          metric: "COUNT",
          filters: apiFilters,
        },
      },
      fetchPolicy: "cache-and-network",
    });

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(repeatingStatsLoading);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatingStatsLoading]); // Only depend on loading state, not onLoadingChange // Only depend on loading state, not onLoadingChange

  // 2️⃣ DATE-BREAKDOWN QUERY (createdAt + repeatingType)
  const { data: repeatingByDateData } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "WORK_ORDERS",
        groupByFields: ["createdAt", "repeatingType"],
        metric: "COUNT",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  // 3️⃣ COMPUTE STATS FOR HEADER
  const stats = useMemo(() => {
    if (!repeatingStatsData?.getChartData)
      return { repeating: 0, nonRepeating: 0, repeatingRatio: 0 };

    const rows = repeatingStatsData.getChartData;

    const repeating =
      rows.find((r: any) => r.groupValues?.[0] === "REPEATING")?.value || 0;

    const nonRepeating =
      rows.find((r: any) => r.groupValues?.[0] === "NON_REPEATING")?.value || 0;

    const total = repeating + nonRepeating;
    const repeatingRatio =
      total > 0 ? ((repeating / total) * 100).toFixed(1) : 0;

    return { repeating, nonRepeating, repeatingRatio };
  }, [repeatingStatsData]);

  // 4️⃣ BUILD BAR CHART DATA
  const chartData = useMemo(() => {
    if (!repeatingByDateData?.getChartData) return [];

    const dateMap = new Map<
      string,
      { repeating: number; nonRepeating: number }
    >();

    repeatingByDateData.getChartData.forEach((item) => {
      const [dateLabel, type] = item.groupValues || [];
      if (!dateLabel || !type || dateLabel === "Unassigned") return;

      if (!dateMap.has(dateLabel)) {
        dateMap.set(dateLabel, { repeating: 0, nonRepeating: 0 });
      }

      const entry = dateMap.get(dateLabel)!;

      if (type === "REPEATING") entry.repeating = item.value;
      if (type === "NON_REPEATING") entry.nonRepeating = item.value;
    });

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, data]) => {
        let formatted = dateStr;
        try {
          // Handle both ISO date strings and timestamps
          const dateValue = !isNaN(Number(dateStr))
            ? new Date(Number(dateStr))
            : parseISO(dateStr);
          if (isValid(dateValue)) {
            formatted = format(dateValue, "MMM dd");
          }
        } catch (e) {
          console.error("Date parsing error:", e, dateStr);
        }

        return { date: formatted, ...data };
      });
  }, [repeatingByDateData]);

  if (repeatingStatsLoading) {
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
            Non-Repeating vs. Repeating
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
        {/* HEADER  */}

        <div className="grid grid-cols-3 gap-8 mb-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">{stats.nonRepeating}</div>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Non Repeating
            </Button>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">{stats.repeating}</div>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              Repeating
            </Button>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">
              {stats.repeatingRatio}
              <span className="text-3xl">%</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">Repeating Ratio</div>
          </div>
        </div>

        {/* BAR CHART */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              tickFormatter={(value) => value}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Legend />

            <Bar
              dataKey="nonRepeating"
              fill="#fcd34d"
              name="Non-Repeating"
              stackId="a"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="repeating"
              fill="#3b82f6"
              name="Repeating"
              stackId="a"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
