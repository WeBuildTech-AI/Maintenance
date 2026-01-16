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
import { formatINR } from "../../utils/dollar_rupee_convert";

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
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-gray-900">Time vs. Cost Reports</h3>
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-gray-300 hover:bg-gray-50"
          >
            <span className="text-xl">+</span>
          </Button>
        </div>

        {/* Stats Row - Horizontal Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Total Time Card */}
          <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-300 text-center">
            <div className="text-sm font-semibold text-blue-700 mb-1">Total Reported Time</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{totals.totalHours.toFixed(1)}</span>
              <span className="text-base font-medium text-gray-400 ml-1">hrs</span>
            </div>
          </div>

          {/* Total Cost Card */}
          <div className="bg-emerald-50 rounded-lg p-3 border-2 border-emerald-300 text-center">
            <div className="text-sm font-semibold text-emerald-700 mb-1">Total Reported Cost</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{formatINR(Math.round(totals.totalCost))}</span>
            </div>
          </div>
        </div>

        {/* Chart - Full Width */}
        <div className="w-full">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartDataForChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: any, name: string) => {
                  if (name === "Time (hours)") return [`${value}h`, "Time"];
                  if (name === "Cost (₹)") return [`${formatINR(value)}`, "Cost"];
                  return value;
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "16px" }} iconType="circle" />
              {viewMode === "time" ? (
                <Bar dataKey="timeHours" fill="#3b82f6" name="Time (hours)" />
              ) : (
                <Bar dataKey="cost" fill="#10b981" name="Cost (₹)" />

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
                  ? "bg-blue-500 text-white hover:bg-blue-600"
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
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : ""
              }
            >
              Cost Reported
            </Button>
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
                Cost (₹)
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
                    {formatINR(Math.round(row.cost))}
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
