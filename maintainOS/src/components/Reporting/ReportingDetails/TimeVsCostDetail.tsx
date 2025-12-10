import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHART_DATA } from "../../../graphql/reporting.queries";
import { mapFilters } from "../filterUtils";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, isValid } from "date-fns";

interface Props {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
}

type GroupBy =
  | "User"
  | "Team"
  | "Asset"
  | "Location"
  | "Category"
  | "Asset Type"
  | "Vendor";

type ViewMode = "time" | "cost";

const groupByOptions: GroupBy[] = [
  "User",
  "Team",
  "Asset",
  "Location",
  "Category",
  "Asset Type",
  "Vendor",
];

const groupByFieldMap: Record<GroupBy, string> = {
  User: "assigneeIds",
  Team: "teamIds",
  Asset: "assetIds",
  Location: "locationId",
  Category: "categoryIds",
  "Asset Type": "assetTypeIds",
  Vendor: "vendorIds",
};

export function TimeVsCostDetail({ filters, dateRange }: Props) {
  const [selectedGroupBy, setSelectedGroupBy] = useState<GroupBy>("Location");
  const [viewMode, setViewMode] = useState<ViewMode>("cost");

  const apiFilters = useMemo(() => {
    return mapFilters(filters, dateRange);
  }, [filters, dateRange]);

  // Query for chart data (date-based, independent of groupBy selection)
  const { data: chartData } = useQuery<{
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

  // Query for table data (grouped by selected field)
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
        groupByFields: [groupByFieldMap[selectedGroupBy]],
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const tableData = useMemo(() => {
    if (!data?.getChartData) return [];

    console.log(`[TimeVsCost] Data for ${selectedGroupBy}:`, data.getChartData);

    const grouped = new Map<
      string,
      {
        name: string;
        timeMinutes: number;
        timeHours: number;
        cost: number;
      }
    >();

    data.getChartData.forEach((item) => {
      const [groupName] = item.groupValues || [];
      if (
        !groupName ||
        groupName === "Unassigned" ||
        groupName === "null" ||
        groupName === "undefined"
      )
        return;

      if (!grouped.has(groupName)) {
        grouped.set(groupName, {
          name: groupName,
          timeMinutes: 0,
          timeHours: 0,
          cost: 0,
        });
      }

      const entry = grouped.get(groupName)!;
      entry.timeMinutes += item.totalTimeMinutes || 0;
      entry.cost += item.totalCost || 0;
      entry.timeHours = entry.timeMinutes / 60;
    });

    return Array.from(grouped.values());
  }, [data, selectedGroupBy]);

  // Process chart data by date
  const chartDataForChart = useMemo(() => {
    if (!chartData?.getChartData) return [];

    const dateMap = new Map<
      string,
      { timeMinutes: number; timeHours: number; cost: number }
    >();

    chartData.getChartData.forEach((item) => {
      const [dateLabel] = item.groupValues || [];
      if (!dateLabel || dateLabel === "Unassigned") return;

      if (!dateMap.has(dateLabel)) {
        dateMap.set(dateLabel, { timeMinutes: 0, timeHours: 0, cost: 0 });
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
          name: formatted,
          timeHours: Math.round(data.timeHours * 10) / 10,
          cost: Math.round(data.cost),
        };
      });
  }, [chartData]);

  const totals = useMemo(() => {
    const totalTimeMinutes = tableData.reduce(
      (sum, row) => sum + row.timeMinutes,
      0
    );
    const totalCost = tableData.reduce((sum, row) => sum + row.cost, 0);
    const totalHours = totalTimeMinutes / 60;
    return { totalTimeMinutes, totalCost, totalHours };
  }, [tableData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Time vs. Cost Reports</h3>
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-gray-300"
          >
            <span className="text-xl">+</span>
          </Button>
        </div>

        {/* Horizontal Layout: Stats Left, Chart Right */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-6 min-w-[320px]">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end min-w-[100px]">
                <span className="text-5xl font-bold leading-tight">
                  {totals.totalHours.toFixed(1)} hrs
                </span>
                {/* <span className="text-xl font-bold text-gray-400">h</span> */}
              </div>
              <div className="px-4 py-2 border-2 border-blue-400 rounded-md bg-blue-50 text-blue-600 font-medium text-xs">
                Total Reported
                {/* <br /> */}
                Time Spent
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end min-w-[100px]">
                <span className="text-5xl font-bold leading-tight">
                  ${Math.round(totals.totalCost)}
                </span>
              </div>
              <div className="px-4 py-2 border-2 border-blue-400 rounded-md bg-blue-50 text-blue-600 font-medium text-xs">
                Total Reported
                Cost Spent
              </div>
            </div>
          </div>

          <div className="flex-1 pl-8 border-l">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartDataForChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "Time (hours)") return [`${value}h`, "Time"];
                    if (name === "Cost ($)") return [`$${value}`, "Cost"];
                    return value;
                  }}
                />
                <Legend />
                {viewMode === "time" ? (
                  <Bar dataKey="timeHours" fill="#3b82f6" name="Time (hours)" />
                ) : (
                  <Bar dataKey="cost" fill="#3b82f6" name="Cost ($)" />
                )}
              </BarChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-2 mt-4">
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
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700 mr-2">
          Grouped by:
        </span>
        {groupByOptions.map((option) => (
          <Button
            key={option}
            variant={selectedGroupBy === option ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGroupBy(option)}
            className={
              selectedGroupBy === option
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : ""
            }
          >
            {option}
          </Button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Time vs. Cost Reports</h3>
        <Button variant="ghost" size="sm" className="text-gray-600">
          <span className="mr-2">↓</span> 1 – 1 of 1
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Full Name
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Time (hours)
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Cost ($)
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              tableData.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {row.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.timeHours.toFixed(1)}h
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    ${Math.round(row.cost)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
