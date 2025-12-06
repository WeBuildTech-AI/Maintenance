import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHART_DATA } from "../../../graphql/reporting.queries";
import { mapFilters } from "../filterUtils";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

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
  User: "assigneeId",
  Team: "teamIds",
  Asset: "assetIds",
  Location: "locationId",
  Category: "categoryIds",
  "Asset Type": "assetTypeId",
  Vendor: "vendorIds",
};

export function PriorityDetail({ filters, dateRange }: Props) {
  const [selectedGroupBy, setSelectedGroupBy] = useState<GroupBy>("Location");

  const apiFilters = useMemo(() => {
    return mapFilters(filters, dateRange);
  }, [filters, dateRange]);

  // Query for chart data (priority totals, independent of groupBy)
  const { data: chartData } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "WORK_ORDERS",
        groupByFields: ["priority"],
        metric: "COUNT",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  // Query for table data (grouped by selected field)
  const { data, loading } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "WORK_ORDERS",
        groupByFields: [groupByFieldMap[selectedGroupBy], "priority"],
        metric: "COUNT",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const tableData = useMemo(() => {
    if (!data?.getChartData) return [];

    console.log(`[Priority] Data for ${selectedGroupBy}:`, data.getChartData);

    const grouped = new Map<
      string,
      { name: string; none: number; low: number; medium: number; high: number }
    >();

    data.getChartData.forEach((item) => {
      const [groupName, priority] = item.groupValues || [];
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
          none: 0,
          low: 0,
          medium: 0,
          high: 0,
        });
      }

      const entry = grouped.get(groupName)!;
      const priorityLower = priority?.toLowerCase();

      if (priorityLower === "none") entry.none = item.value;
      else if (priorityLower === "low") entry.low = item.value;
      else if (priorityLower === "medium") entry.medium = item.value;
      else if (priorityLower === "high") entry.high = item.value;
    });

    return Array.from(grouped.values());
  }, [data]);

  const totals = useMemo(() => {
    if (!chartData?.getChartData)
      return { none: 0, low: 0, medium: 0, high: 0 };

    const rows = chartData.getChartData;
    const none =
      rows.find((r) => r.groupValues?.[0]?.toLowerCase() === "none")?.value ||
      0;
    const low =
      rows.find((r) => r.groupValues?.[0]?.toLowerCase() === "low")?.value || 0;
    const medium =
      rows.find((r) => r.groupValues?.[0]?.toLowerCase() === "medium")?.value ||
      0;
    const high =
      rows.find((r) => r.groupValues?.[0]?.toLowerCase() === "high")?.value ||
      0;

    return { none, low, medium, high };
  }, [chartData]);

  const pieData = useMemo(
    () => [
      { name: "None", value: totals.none, color: "#3B82F6" },
      { name: "Low", value: totals.low, color: "#10B981" },
      { name: "Medium", value: totals.medium, color: "#F59E0B" },
      { name: "High", value: totals.high, color: "#EF4444" },
    ],
    [totals]
  );

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
          <h3 className="text-xl font-bold">Priority</h3>
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
          {/* Left Side: Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-6xl font-bold">{totals.none}</div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                None
              </Button>
            </div>

            <div className="text-center">
              <div className="text-6xl font-bold">{totals.low}</div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-green-600 border-green-300 hover:bg-green-50"
              >
                Low
              </Button>
            </div>

            <div className="text-center">
              <div className="text-6xl font-bold">{totals.medium}</div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Medium
              </Button>
            </div>

            <div className="text-center">
              <div className="text-6xl font-bold">{totals.high}</div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                High
              </Button>
            </div>
          </div>

          {/* Right Side: Pie Chart */}
          <div className="flex-1 pl-8 border-l">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
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
        <h3 className="text-lg font-semibold">Priority</h3>
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
                None
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Low
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Medium
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                High
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
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
                    {row.none}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.low}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.medium}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.high}
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
