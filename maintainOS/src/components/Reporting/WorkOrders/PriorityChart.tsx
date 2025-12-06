import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHART_DATA } from "../../../graphql/reporting.queries";
import { Card, CardHeader, CardContent, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Info, ChevronRight, Plus, Loader2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { mapFilters } from "../filterUtils";

interface WorkOrdersPriorityChartProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
}

export function WorkOrdersPriorityChart({
  filters,
  dateRange,
}: WorkOrdersPriorityChartProps) {
  const apiFilters = useMemo(
    () => mapFilters(filters, dateRange),
    [filters, dateRange]
  );

  const { data, loading } = useQuery<{
    getChartData: Array<{ label: string; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "WORK_ORDERS",
        groupByField: "priority",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </Card>
    );
  }

  const rows = data?.getChartData || [];

  const none =
    rows.find((r: any) => r.label?.toLowerCase() === "none")?.value || 0;
  const low =
    rows.find((r: any) => r.label?.toLowerCase() === "low")?.value || 0;
  const medium =
    rows.find((r: any) => r.label?.toLowerCase() === "medium")?.value || 0;
  const high =
    rows.find((r: any) => r.label?.toLowerCase() === "high")?.value || 0;

  const pieData = [
    { name: "None", value: none, color: "#3B82F6" },
    { name: "Low", value: low, color: "#10B981" },
    { name: "Medium", value: medium, color: "#F59E0B" },
    { name: "High", value: high, color: "#EF4444" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Priority</CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
          <ChevronRight className="h-4 w-4 text-blue-500" />
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {/* ───────── TOP PRIORITY COUNTS ───────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 text-center max-w-4xl mx-auto py-12">
          <div className="text-center">
            <div className="text-6xl font-bold">{none}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              None
            </Button>
          </div>

          <div className="text-center">
            <div className="text-6xl font-bold">{low}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-green-600 border-green-300 hover:bg-green-50"
            >
              Low
            </Button>
          </div>

          <div className="text-center">
            <div className="text-6xl font-bold">{medium}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              Medium
            </Button>
          </div>

          <div className="text-center">
            <div className="text-6xl font-bold">{high}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              High
            </Button>
          </div>
        </div>

        {/* ───────── DONUT PIE CHART ───────── */}
        <div className="flex justify-center">
          <ResponsiveContainer width="60%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
