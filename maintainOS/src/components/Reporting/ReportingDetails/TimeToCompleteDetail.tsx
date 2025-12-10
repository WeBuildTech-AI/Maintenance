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
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Time to Complete</h3>
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-gray-300"
          >
            <span className="text-xl">+</span>
          </Button>
        </div>

        {/* Horizontal Layout: Stats on Left, Chart on Right */}
        <div className="flex items-center gap-8">
          {/* Left Side: Stats */}
          <div className="flex flex-col gap-6 min-w-[280px]">
            {/* Total Hours Stat */}
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold min-w-[100px] text-right">
                {stats.totalHours}
                <span className="text-3xl">h</span>
              </span>
              <div className="px-6 py-2 border-2 border-gray-300 rounded-md bg-gray-50 text-gray-700 font-semibold text-sm whitespace-nowrap">
                Total Hours
              </div>
            </div>

            {/* AVG Hours Stat */}
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold min-w-[100px] text-right">
                {stats.avgHours}
                <span className="text-3xl">h</span>
              </span>
              <div className="px-6 py-2 border-2 border-teal-400 rounded-md bg-teal-50 text-black font-semibold text-sm whitespace-nowrap">
                AVG Hours
              </div>
            </div>

            {/* MTTR AVG Hours Stat */}
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold min-w-[100px] text-right">
                {stats.mttrAvgHours}
                <span className="text-3xl">h</span>
              </span>
              <div className="flex flex-col gap-1">
                <div className="px-6 py-2 border-2 border-blue-400 rounded-md bg-blue-50 text-blue-600 font-semibold text-sm whitespace-nowrap">
                  MTTR AVG Hours
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Only on Non-Repeating Work Orders
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Chart */}
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart
                data={chartDataForChart}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="mttrAvgHours"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 6, strokeWidth: 0 }}
                  name="MTTR AVG Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
