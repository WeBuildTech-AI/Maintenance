import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHART_DATA } from "../../../graphql/reporting.queries";
import { mapFilters } from "../filterUtils";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
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

export function WorkOrdersByTypeDetail({ filters, dateRange }: Props) {
  const [selectedGroupBy, setSelectedGroupBy] = useState<GroupBy>("Location");

  const apiFilters = useMemo(() => {
    return mapFilters(filters, dateRange);
  }, [filters, dateRange]);

  // Query for chart data (date-based, independent of groupBy selection)
  const { data: chartData } = useQuery<{
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

  // Query for table data (grouped by selected field)
  const { data, loading } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "WORK_ORDERS",
        groupByFields: [groupByFieldMap[selectedGroupBy], "workType"],
        metric: "COUNT",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const tableData = useMemo(() => {
    if (!data?.getChartData) return [];

    console.log(
      `[WorkOrdersByType] Data for ${selectedGroupBy}:`,
      data.getChartData
    );

    const grouped = new Map<
      string,
      {
        name: string;
        preventive: number;
        reactive: number;
        other: number;
        preventiveRatio: number;
      }
    >();

    data.getChartData.forEach((item) => {
      const [groupName, workType] = item.groupValues || [];
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
          preventive: 0,
          reactive: 0,
          other: 0,
          preventiveRatio: 0,
        });
      }

      const entry = grouped.get(groupName)!;
      const workTypeLower = workType?.toLowerCase();

      if (workTypeLower === "preventive") entry.preventive = item.value;
      else if (workTypeLower === "reactive") entry.reactive = item.value;
      else if (workTypeLower === "other") entry.other = item.value;
    });

    return Array.from(grouped.values()).map((entry) => {
      const total = entry.preventive + entry.reactive + entry.other;
      return {
        ...entry,
        preventiveRatio:
          total > 0 ? Math.round((entry.preventive / total) * 100) : 0,
      };
    });
  }, [data]);

  // Process chart data by date
  const chartDataForChart = useMemo(() => {
    if (!chartData?.getChartData) return [];

    const dateMap = new Map<
      string,
      { preventive: number; reactive: number; other: number }
    >();

    chartData.getChartData.forEach((item) => {
      const [dateLabel, workType] = item.groupValues || [];
      if (!dateLabel || dateLabel === "Unassigned") return;

      if (!dateMap.has(dateLabel)) {
        dateMap.set(dateLabel, { preventive: 0, reactive: 0, other: 0 });
      }

      const entry = dateMap.get(dateLabel)!;
      const workTypeLower = workType?.toLowerCase();
      if (workTypeLower === "preventive") entry.preventive = item.value;
      else if (workTypeLower === "reactive") entry.reactive = item.value;
      else if (workTypeLower === "other") entry.other = item.value;
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
        return { name: formatted, ...data };
      });
  }, [chartData]);

  const totals = useMemo(() => {
    const preventive = tableData.reduce((sum, row) => sum + row.preventive, 0);
    const reactive = tableData.reduce((sum, row) => sum + row.reactive, 0);
    const other = tableData.reduce((sum, row) => sum + row.other, 0);
    const total = preventive + reactive + other;
    const preventiveRatio =
      total > 0 ? Math.round((preventive / total) * 100) : 0;
    return { preventive, reactive, other, preventiveRatio };
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
          <h3 className="text-xl font-bold text-gray-900">Work Orders by Type</h3>
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-gray-300 hover:bg-gray-50"
          >
            <span className="text-xl">+</span>
          </Button>
        </div>

        {/* Stats Row - Horizontal Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Preventive Card */}
          <div className="bg-teal-50 rounded-lg p-3 border-2 border-teal-300 text-center">
            <div className="text-sm font-semibold text-teal-700 mb-1">Preventive</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{totals.preventive}</span>
            </div>
          </div>

          {/* Reactive Card */}
          <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-300 text-center">
            <div className="text-sm font-semibold text-blue-700 mb-1">Reactive</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{totals.reactive}</span>
            </div>
          </div>

          {/* Other Card */}
          <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-300 text-center">
            <div className="text-sm font-semibold text-gray-600 mb-1">Other</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{totals.other}</span>
            </div>
          </div>

          {/* Preventive Ratio Card */}
          <div className="bg-emerald-50 rounded-lg p-3 border-2 border-emerald-300 text-center">
            <div className="text-sm font-semibold text-emerald-700 mb-1">Preventive Ratio</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{totals.preventiveRatio}</span>
              <span className="text-base font-medium text-gray-400 ml-1">%</span>
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
              />
              <Legend wrapperStyle={{ paddingTop: "16px" }} iconType="circle" />
              <Bar dataKey="preventive" fill="#14b8a6" name="Preventive" />
              <Bar dataKey="reactive" fill="#3b82f6" name="Reactive" />
              <Bar dataKey="other" fill="#9ca3af" name="Other" />
            </BarChart>
          </ResponsiveContainer>
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
        <h3 className="text-lg font-semibold">Work Orders by Type</h3>
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
                Preventive
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Reactive
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Other
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Preventive Ratio
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
                    {row.preventive}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.reactive}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.other}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.preventiveRatio}%
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
