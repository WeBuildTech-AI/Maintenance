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

interface WorkOrdersStatusChartProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
}

export function WorkOrdersStatusChart({
  filters,
  dateRange,
}: WorkOrdersStatusChartProps) {
  const apiFilters = useMemo(
    () => mapFilters(filters, dateRange),
    [filters, dateRange]
  );

  const { data, loading } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
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

  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </Card>
    );
  }

  const rows = data?.getChartData || [];

  const open =
    rows.find((r: any) => r.groupValues?.[0]?.toLowerCase() === "open")
      ?.value || 0;
  const onHold =
    rows.find((r: any) => r.groupValues?.[0]?.toLowerCase() === "on_hold")
      ?.value || 0;
  const inProgress =
    rows.find((r: any) => r.groupValues?.[0]?.toLowerCase() === "in_progress")
      ?.value || 0;
  const done =
    rows.find((r: any) => r.groupValues?.[0]?.toLowerCase() === "done")
      ?.value || 0;

  const pieData = [
    { name: "Open", value: open, color: "#3B82F6" },
    { name: "Done", value: done, color: "#10B981" },
    { name: "On Hold", value: onHold, color: "#880808" },
    { name: "In Progress", value: inProgress, color: "#E1C16E" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Status</CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
          <ChevronRight className="h-4 w-4 text-blue-500" />
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {/* -------- TOP STATUS NUMBERS -------- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 text-center max-w-4xl mx-auto py-12">
          <div className="text-center">
            <div className="text-6xl font-bold">{open}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Open
            </Button>
          </div>

          <div className="text-center">
            <div className="text-6xl font-bold">{onHold}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-orange-600 border-orange-300 hover:bg-red-50"
            >
              On Hold
            </Button>
          </div>

          <div className="text-center">
            <div className="text-6xl font-bold">{inProgress}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-blue-400 border-blue-200 hover:bg-orange-50"
            >
              In Progress
            </Button>
          </div>

          <div className="text-center">
            <div className="text-6xl font-bold">{done}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-green-600 border-green-300 hover:bg-green-50"
            >
              Done
            </Button>
          </div>
        </div>

        {/* -------- DONUT PIE CHART -------- */}
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
