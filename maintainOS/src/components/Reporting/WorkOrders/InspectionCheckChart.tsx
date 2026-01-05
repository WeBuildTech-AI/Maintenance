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

interface InspectionCheckChartProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
  onNavigateToDetails?: () => void;
}

export function InspectionCheckChart({
  filters,
  dateRange,
  onNavigateToDetails,
}: InspectionCheckChartProps) {
  const apiFilters = useMemo(() => {
    const mapped = mapFilters(filters, dateRange);
    return mapped;
  }, [filters, dateRange]);

  // Fetch Inspection Check data grouped by result
  const { data: resultData, loading: resultLoading } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "INSPECTION_CHECK",
        groupByFields: ["result"],
        metric: "COUNT",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  // Fetch Inspection Check data grouped by date for the chart
  const { data: dateData } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
      variables: {
        input: {
          dataset: "INSPECTION_CHECK",
          groupByFields: ["createdAt", "result"],
          metric: "COUNT",
          filters: apiFilters,
        },
      },
      fetchPolicy: "cache-and-network",
    });

  // Calculate stats from result data
  const stats = useMemo(() => {
    if (!resultData?.getChartData)
      return { pass: 0, flag: 0, fail: 0, total: 0, percent: 0 };

    const rows = resultData.getChartData;
    let pass = 0;
    let flag = 0;
    let fail = 0;

    rows.forEach((r: any) => {
      const result = r.groupValues?.[0]?.toLowerCase();
      if (result === "pass" || result === "passed") {
        pass += r.value;
      } else if (result === "flag" || result === "flagged") {
        flag += r.value;
      } else if (result === "fail" || result === "failed") {
        fail += r.value;
      }
    });

    const total = pass + flag + fail;
    const percent = total > 0 ? ((pass / total) * 100).toFixed(1) : 0;

    return { pass, flag, fail, total, percent };

  }, [resultData]);

  // Process data for stacked bar chart
  const chartData = useMemo(() => {
    if (!dateData?.getChartData) return [];

    const dateMap = new Map<string, { pass: number; flag: number; fail: number }>();
    const allDates = new Set<string>();

    dateData.getChartData.forEach((item: any) => {
      const dateLabel = item.groupValues?.[0];
      const result = item.groupValues?.[1]?.toLowerCase();

      if (dateLabel && dateLabel !== "Unassigned") {
        allDates.add(dateLabel);

        if (!dateMap.has(dateLabel)) {
          dateMap.set(dateLabel, { pass: 0, flag: 0, fail: 0 });
        }

        const entry = dateMap.get(dateLabel)!;
        if (result === "pass" || result === "passed") {
          entry.pass += item.value;
        } else if (result === "flag" || result === "flagged") {
          entry.flag += item.value;
        } else if (result === "fail" || result === "failed") {
          entry.fail += item.value;
        }
      }
    });

    return Array.from(allDates)
      .sort()
      .map((dateStr) => {
        let formattedDate = dateStr;
        try {
          const dateValue = !isNaN(Number(dateStr))
            ? new Date(Number(dateStr))
            : parseISO(dateStr);
          if (isValid(dateValue)) {
            formattedDate = format(dateValue, "MM/dd/yyyy");
          }
        } catch (e) {
          console.error("Date parsing error:", e, dateStr);
        }

        const entry = dateMap.get(dateStr) || { pass: 0, flag: 0, fail: 0 };
        return {
          date: formattedDate,
          rawDate: dateStr,
          pass: entry.pass,
          flag: entry.flag,
          fail: entry.fail,
        };
      });
  }, [dateData]);

  if (resultLoading) {
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
            Completed with Inspection Check
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
        {/* --- FIXED STATS LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 text-center max-w-4xl mx-auto py-12">
          {/* Pass */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold">{stats.pass}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-green-600 border-green-300 hover:bg-green-50"
            >
              Pass
            </Button>
          </div>

          {/* Flag */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold">{stats.flag}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              Flag
            </Button>
          </div>

          {/* Fail */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold">{stats.fail}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              Fail
            </Button>
          </div>

          {/* Ratio */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold flex items-baseline">
              {stats.percent}
              <span className="text-xl ml-1">%</span>
            </div>
            <div className="mt-2 text-sm text-gray-600 font-medium">
              Inspection Checks completed
            </div>
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
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="pass"
              stackId="a"
              fill="#10b981"
              name="Pass"
            />
            <Bar
              dataKey="flag"
              stackId="a"
              fill="#f97316"
              name="Flag"
            />
            <Bar
              dataKey="fail"
              stackId="a"
              fill="#ef4444"
              name="Fail"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
