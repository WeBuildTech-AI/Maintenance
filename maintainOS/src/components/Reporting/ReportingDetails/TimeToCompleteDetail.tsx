import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHART_DATA } from "../../../graphql/reporting.queries";
import { mapFilters } from "../filterUtils";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
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

export function TimeToCompleteDetail({ filters, dateRange }: Props) {
  const [selectedGroupBy, setSelectedGroupBy] = useState<GroupBy>("User");

  const apiFilters = useMemo(() => {
    return mapFilters(filters, dateRange);
  }, [filters, dateRange]);

  // Fetch chart data (for the line chart - date based)
  const { data: chartData, loading: chartLoading } = useQuery<{
    getChartData: Array<{
      groupValues: string[];
      value: number;
      mttrAvgHours?: number;
    }>;
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

  // Fetch grouped data for table
  const { data, loading } = useQuery<{
    getChartData: Array<{
      groupValues: string[];
      value: number;
      mttrAvgHours?: number;
    }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "TIME_TO_COMPLETE",
        groupByFields: [groupByFieldMap[selectedGroupBy]],
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
    skip: !groupByFieldMap[selectedGroupBy],
  });

  // Calculate stats from chart data
  const stats = useMemo(() => {
    if (!chartData?.getChartData || chartData.getChartData.length === 0) {
      return { totalHours: 0, avgHours: 0, mttrAvgHours: 0 };
    }

    const items = chartData.getChartData;
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
  }, [chartData]);

  // Prepare chart data for line chart
  const chartDataForChart = useMemo(() => {
    if (!chartData?.getChartData) return [];

    return chartData.getChartData
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
  }, [chartData]);

  // Process data into table format
  const tableData = useMemo(() => {
    if (!data?.getChartData) return [];

    return data.getChartData
      .filter((item) => {
        const groupName = item.groupValues?.[0];
        return (
          groupName &&
          groupName !== "Unassigned" &&
          groupName !== "null" &&
          groupName !== "undefined"
        );
      })
      .map((item) => ({
        name: item.groupValues?.[0] || "Unknown",
        hours: Number((item.value || 0).toFixed(1)),
        mttrAvgHours: item.mttrAvgHours
          ? Number(item.mttrAvgHours.toFixed(1))
          : 0,
      }));
  }, [data, selectedGroupBy]);

  if (loading || chartLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-0 pb-12">
      {/* Chart Section */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-gray-900">Time to Complete</h3>
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-gray-300 hover:bg-gray-50"
          >
            <span className="text-xl">+</span>
          </Button>
        </div>

        {/* Stats Row - Horizontal Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Total Hours Card */}
          <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200 text-center">
            <div className="text-sm font-semibold text-gray-600 mb-1">Total Hours</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{stats.totalHours}</span>
              <span className="text-base font-medium text-gray-400 ml-1">h</span>
            </div>
          </div>

          {/* AVG Hours Card */}
          <div className="bg-amber-50 rounded-lg p-3 border-2 border-amber-300 text-center">
            <div className="text-sm font-semibold text-amber-700 mb-1">AVG Hours</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{stats.avgHours}</span>
              <span className="text-base font-medium text-gray-400 ml-1">h</span>
            </div>
          </div>

          {/* MTTR AVG Hours Card */}
          <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-300 text-center">
            <div className="text-sm font-semibold text-blue-700 mb-1">MTTR AVG Hours</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{stats.mttrAvgHours}</span>
              <span className="text-base font-medium text-gray-400 ml-1">h</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Only on Non-Repeating Work Orders</div>
          </div>
        </div>

        {/* Chart - Full Width */}
        <div className="w-full">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartDataForChart}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "16px" }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="mttrAvgHours"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 5, strokeWidth: 0 }}
                activeDot={{ r: 7, fill: "#2563eb" }}
                name="MTTR AVG Hours"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Group By Buttons */}
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

      <div className="flex justify-end items-center">
        <Button variant="ghost" size="sm" className="text-gray-600">
          <span className="mr-2">↓</span> 1 – {tableData.length} of{" "}
          {tableData.length}
        </Button>
      </div>

      {/* Data Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                {selectedGroupBy}
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Hours
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                MTTR AVG Hours
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
                    {row.hours}h
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.mttrAvgHours}h
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
