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

export function NonRepeatingVsRepeatingDetail({ filters, dateRange }: Props) {
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
        groupByFields: ["createdAt", "repeatingType"],
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
        groupByFields: [groupByFieldMap[selectedGroupBy], "repeatingType"],
        metric: "COUNT",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const tableData = useMemo(() => {
    if (!data?.getChartData) return [];

    console.log(
      `[NonRepeating] Data for ${selectedGroupBy}:`,
      data.getChartData
    );

    const grouped = new Map<
      string,
      {
        name: string;
        nonRepeating: number;
        repeating: number;
        repeatingRatio: number;
      }
    >();

    data.getChartData.forEach((item) => {
      const [groupName, type] = item.groupValues || [];
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
          nonRepeating: 0,
          repeating: 0,
          repeatingRatio: 0,
        });
      }

      const entry = grouped.get(groupName)!;

      if (type === "NON_REPEATING") {
        entry.nonRepeating = item.value;
      } else if (type === "REPEATING") {
        entry.repeating = item.value;
      }
    });

    return Array.from(grouped.values()).map((entry) => {
      const total = entry.nonRepeating + entry.repeating;
      return {
        ...entry,
        repeatingRatio:
          total > 0 ? Math.round((entry.repeating / total) * 100) : 0,
      };
    });
  }, [data]);

  // Process chart data by date
  const chartDataForChart = useMemo(() => {
    if (!chartData?.getChartData) return [];

    const dateMap = new Map<
      string,
      { nonRepeating: number; repeating: number }
    >();

    chartData.getChartData.forEach((item) => {
      const [dateLabel, type] = item.groupValues || [];
      if (!dateLabel || dateLabel === "Unassigned") return;

      if (!dateMap.has(dateLabel)) {
        dateMap.set(dateLabel, { nonRepeating: 0, repeating: 0 });
      }

      const entry = dateMap.get(dateLabel)!;
      if (type === "NON_REPEATING") entry.nonRepeating = item.value;
      else if (type === "REPEATING") entry.repeating = item.value;
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
    const nonRepeating = tableData.reduce(
      (sum, row) => sum + row.nonRepeating,
      0
    );
    const repeating = tableData.reduce((sum, row) => sum + row.repeating, 0);
    const total = nonRepeating + repeating;
    const repeatingRatio =
      total > 0 ? Math.round((repeating / total) * 100) : 0;
    return { nonRepeating, repeating, repeatingRatio };
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
          <h3 className="text-xl font-bold">Non-Repeating vs. Repeating</h3>
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
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <span className="text-6xl font-bold min-w-[80px] text-right">
                {totals.nonRepeating}
              </span>
              <div className="px-6 py-2 border-2 border-yellow-400 rounded-md bg-yellow-50 text-yellow-600 font-semibold text-sm whitespace-nowrap">
                Non-Repeating
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-6xl font-bold min-w-[80px] text-right">
                {totals.repeating}
              </span>
              <div className="px-6 py-2 border-2 border-blue-400 rounded-md bg-blue-50 text-blue-600 font-semibold text-sm whitespace-nowrap">
                Repeating
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-6xl font-bold min-w-[80px] text-right">
                {totals.repeatingRatio}
                <span className="text-3xl">%</span>
              </span>
              <div className="text-sm text-gray-600">Repeating Ratio</div>
            </div>
          </div>

          {/* Right Side: Chart */}
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
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="nonRepeating"
                  fill="#fcd34d"
                  name="Non-Repeating"
                />
                <Bar dataKey="repeating" fill="#3b82f6" name="Repeating" />
              </BarChart>
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
        <h3 className="text-lg font-semibold">Non-Repeating vs. Repeating</h3>
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
                Non-Repeating
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Repeating
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Repeating Ratio
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
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
                    {row.nonRepeating}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.repeating}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.repeatingRatio}%
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
