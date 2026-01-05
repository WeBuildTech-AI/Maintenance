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
  "Asset Type": "assetTypeIds",
  Vendor: "vendorIds",
};

export function InspectionCheckDetail({ filters, dateRange }: Props) {
  const [selectedGroupBy, setSelectedGroupBy] = useState<GroupBy>("Location");

  const apiFilters = useMemo(() => {
    return mapFilters(filters, dateRange);
  }, [filters, dateRange]);

  // Fetch chart data (total by result)
  const { data: chartData, loading: chartLoading } = useQuery<{
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

  // Fetch grouped data for table
  const { data, loading } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "INSPECTION_CHECK",
        groupByFields: [groupByFieldMap[selectedGroupBy], "result"],
        metric: "COUNT",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
    skip: !groupByFieldMap[selectedGroupBy],
  });

  // Calculate totals
  const totals = useMemo(() => {
    if (!chartData?.getChartData) return { pass: 0, flag: 0, fail: 0, total: 0 };

    let pass = 0;
    let flag = 0;
    let fail = 0;

    chartData.getChartData.forEach((item) => {
      const result = item.groupValues?.[0]?.toLowerCase();
      if (result === "pass" || result === "passed") {
        pass += item.value;
      } else if (result === "flag" || result === "flagged") {
        flag += item.value;
      } else if (result === "fail" || result === "failed") {
        fail += item.value;
      }
    });

    return { pass, flag, fail, total: pass + flag + fail };
  }, [chartData]);

  // Process data into table format
  const tableData = useMemo(() => {
    if (!data?.getChartData) return [];

    console.log(
      `[InspectionCheck] Data for ${selectedGroupBy}:`,
      data.getChartData
    );

    const grouped = new Map<
      string,
      {
        name: string;
        pass: number;
        flag: number;
        fail: number;
        total: number;
        passRatio: number;
      }
    >();

    data.getChartData.forEach((item) => {
      const [groupName, result] = item.groupValues || [];

      // Filter out invalid group names and result values that might appear as group names
      const groupNameLower = groupName?.toLowerCase();
      if (
        !groupName ||
        groupName === "Unassigned" ||
        groupName === "null" ||
        groupName === "undefined" ||
        // Filter out result values that might incorrectly appear as group names
        groupNameLower === "pass" ||
        groupNameLower === "passed" ||
        groupNameLower === "flag" ||
        groupNameLower === "flagged" ||
        groupNameLower === "fail" ||
        groupNameLower === "failed"
      ) {
        return;
      }

      if (!grouped.has(groupName)) {
        grouped.set(groupName, {
          name: groupName,
          pass: 0,
          flag: 0,
          fail: 0,
          total: 0,
          passRatio: 0,
        });
      }

      const entry = grouped.get(groupName)!;
      const resultLower = result?.toLowerCase();

      entry.total += item.value;

      if (resultLower === "pass" || resultLower === "passed") {
        entry.pass += item.value;
      } else if (resultLower === "flag" || resultLower === "flagged") {
        entry.flag += item.value;
      } else if (resultLower === "fail" || resultLower === "failed") {
        entry.fail += item.value;
      }
    });

    return Array.from(grouped.values())
      .filter((entry) => entry.total > 0)
      .map((entry) => ({
        ...entry,
        passRatio:
          entry.total > 0
            ? Math.round((entry.pass / entry.total) * 100)
            : 0,
      }));
  }, [data]);

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
          <h3 className="text-xl font-bold text-gray-900">Inspection Check Results</h3>
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
          {/* Pass Card */}
          <div className="bg-green-50 rounded-lg p-3 border-2 border-green-300 text-center">
            <div className="text-sm font-semibold text-green-700 mb-1">Pass</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{totals.pass}</span>
            </div>
          </div>

          {/* Flag Card */}
          <div className="bg-orange-50 rounded-lg p-3 border-2 border-orange-300 text-center">
            <div className="text-sm font-semibold text-orange-700 mb-1">Flag</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{totals.flag}</span>
            </div>
          </div>

          {/* Fail Card */}
          <div className="bg-red-50 rounded-lg p-3 border-2 border-red-300 text-center">
            <div className="text-sm font-semibold text-red-700 mb-1">Fail</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{totals.fail}</span>
            </div>
          </div>

          {/* Total Card */}
          <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-300 text-center">
            <div className="text-sm font-semibold text-gray-700 mb-1">Total</div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">{totals.total}</span>
            </div>
          </div>
        </div>

        {/* Chart - Full Width */}
        <div className="w-full">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={[
                { name: "Pass", value: totals.pass, fill: "#10b981" },
                { name: "Flag", value: totals.flag, fill: "#f97316" },
                { name: "Fail", value: totals.fail, fill: "#ef4444" },
              ]}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
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
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
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
                Pass
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Flag
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Fail
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Pass Ratio
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
                  <td className="px-6 py-4 text-green-600 font-medium">
                    {row.pass}
                  </td>
                  <td className="px-6 py-4 text-orange-600 font-medium">
                    {row.flag}
                  </td>
                  <td className="px-6 py-4 text-red-600 font-medium">
                    {row.fail}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.passRatio}%
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
