// import { useState, useMemo } from "react";
// import { useQuery } from "@apollo/client/react";
// import { GET_CHART_DATA } from "../../../graphql/reporting.queries";
// import { mapFilters } from "../filterUtils";
// import { Button } from "../../ui/button";
// import { Loader2 } from "lucide-react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// interface Props {
//   filters: Record<string, any>;
//   dateRange: { startDate: string; endDate: string };
// }

// type GroupBy =
//   | "User"
//   | "Team"
//   | "Asset"
//   | "Location"
//   | "Category"
//   | "Asset Type"
//   | "Vendor";

// const groupByOptions: GroupBy[] = [
//   "User",
//   "Team",
//   "Asset",
//   "Location",
//   "Category",
//   "Asset Type",
//   "Vendor",
// ];

// const groupByFieldMap: Record<GroupBy, string> = {
//   User: "assigneeId",
//   Team: "teamIds",
//   Asset: "assetIds",
//   Location: "locationId",
//   Category: "categoryIds",
//   "Asset Type": "assetTypeIds", // Only if exists in backend
//   Vendor: "vendorIds",
// };

// export function CreatedVsCompletedDetail({ filters, dateRange }: Props) {
//   const [selectedGroupBy, setSelectedGroupBy] = useState<GroupBy>("Location");

//   const apiFilters = useMemo(() => {
//     return mapFilters(filters, dateRange);
//   }, [filters, dateRange]);

//   // Fetch chart data (total created and completed)
//   const { data: chartData, loading: chartLoading } = useQuery<{
//     getChartData: Array<{ groupValues: string[]; value: number }>;
//   }>(GET_CHART_DATA, {
//     variables: {
//       input: {
//         dataset: "WORK_ORDERS",
//         groupByFields: ["status"],
//         metric: "COUNT",
//         filters: apiFilters,
//       },
//     },
//     fetchPolicy: "cache-and-network",
//   });

//   // Fetch grouped data for table
//   const { data, loading } = useQuery<{
//     getChartData: Array<{ groupValues: string[]; value: number }>;
//   }>(GET_CHART_DATA, {
//     variables: {
//       input: {
//         dataset: "WORK_ORDERS",
//         groupByFields: [groupByFieldMap[selectedGroupBy], "status"],
//         metric: "COUNT",
//         filters: apiFilters,
//       },
//     },
//     fetchPolicy: "cache-and-network",
//     skip: !groupByFieldMap[selectedGroupBy],
//   });

//   // Calculate total created and completed
//   const totals = useMemo(() => {
//     if (!chartData?.getChartData) return { created: 0, completed: 0 };

//     let created = 0;
//     let completed = 0;

//     chartData.getChartData.forEach((item) => {
//       const [status] = item.groupValues || [];
//       created += item.value;

//       const statusLower = status?.toLowerCase();
//       if (statusLower === "done" || statusLower === "completed") {
//         completed += item.value;
//       }
//     });

//     return { created, completed };
//   }, [chartData]);

//   // Process data into table format
//   const tableData = useMemo(() => {
//     if (!data?.getChartData) return [];

//     console.log(
//       `[CreatedVsCompleted] Data for ${selectedGroupBy}:`,
//       data.getChartData
//     );

//     const grouped = new Map<
//       string,
//       {
//         name: string;
//         created: number;
//         assigned: number;
//         completed: number;
//         completedRatio: number;
//       }
//     >();

//     data.getChartData.forEach((item) => {
//       const [groupName, status] = item.groupValues || [];

//       // Skip if no group name or if it's "Unassigned" or empty values
//       if (
//         !groupName ||
//         groupName === "Unassigned" ||
//         groupName === "null" ||
//         groupName === "undefined"
//       ) {
//         return;
//       }

//       if (!grouped.has(groupName)) {
//         grouped.set(groupName, {
//           name: groupName,
//           created: 0,
//           assigned: 0,
//           completed: 0,
//           completedRatio: 0,
//         });
//       }

//       const entry = grouped.get(groupName)!;
//       const statusLower = status?.toLowerCase();

//       // Count all as created
//       entry.created += item.value;

//       // Count assigned (any status except unassigned)
//       if (status && statusLower !== "unassigned") {
//         entry.assigned += item.value;
//       }

//       // Count completed
//       if (statusLower === "done" || statusLower === "completed") {
//         entry.completed += item.value;
//       }
//     });

//     // Calculate ratios and filter out entries with no data
//     return Array.from(grouped.values())
//       .filter((entry) => entry.created > 0)
//       .map((entry) => ({
//         ...entry,
//         completedRatio:
//           entry.assigned > 0
//             ? Math.round((entry.completed / entry.assigned) * 100)
//             : 0,
//       }));
//   }, [data]);

//   if (loading || chartLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 pt-0 pb-12">
//       {/* Chart Section */}
//       <div className="bg-white border rounded-lg p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold">Created vs. Completed</h3>
//           <Button
//             variant="outline"
//             size="sm"
//             className="border-2 border-gray-300"
//           >
//             <span className="text-xl">+</span>
//           </Button>
//         </div>

//         {/* Horizontal Layout: Numbers on Left, Chart on Right */}
//         <div className="flex items-center gap-8">
//           {/* Left Side: Stats */}
//           <div className="flex flex-col gap-6">
//             {/* Created Stat */}
//             <div className="flex items-center gap-4">
//               <span className="text-5xl font-bold w-20 text-right">
//                 {totals.created}
//               </span>
//               <div className="px-6 py-2 border-2 border-blue-400 rounded-md bg-blue-50 text-blue-600 font-semibold text-sm whitespace-nowrap">
//                 Created
//               </div>
//             </div>

//             {/* Completed Stat */}
//             <div className="flex items-center gap-4">
//               <span className="text-5xl font-bold w-20 text-right">
//                 {totals.completed}
//               </span>
//               <div className="px-6 py-2 border-2 border-teal-400 rounded-md bg-teal-50 text-black font-semibold text-sm whitespace-nowrap">
//                 Completed
//               </div>
//             </div>
//           </div>

//           {/* Right Side: Chart */}
//           <div className="flex-1">
//             <ResponsiveContainer width="100%" height={250}>
//               <LineChart
//                 data={[
//                   {
//                     date: dateRange.startDate,
//                     Created: totals.created,
//                     Completed: 0,
//                   },
//                   {
//                     date: dateRange.endDate,
//                     Created: totals.created,
//                     Completed: totals.completed,
//                   },
//                 ]}
//                 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                 <XAxis
//                   dataKey="date"
//                   stroke="#6b7280"
//                   fontSize={12}
//                   tickLine={false}
//                 />
//                 <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "white",
//                     border: "1px solid #e5e7eb",
//                     borderRadius: "6px",
//                   }}
//                 />
//                 <Legend
//                   wrapperStyle={{ paddingTop: "20px" }}
//                   iconType="circle"
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="Created"
//                   stroke="#3b82f6"
//                   strokeWidth={3}
//                   dot={{ fill: "#3b82f6", r: 6, strokeWidth: 0 }}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="Completed"
//                   stroke="#14b8a6"
//                   strokeWidth={3}
//                   dot={{ fill: "#14b8a6", r: 6, strokeWidth: 0 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* Group By Buttons */}
//       <div className="flex items-center gap-2 flex-wrap">
//         <span className="text-sm font-medium text-gray-700 mr-2">
//           Grouped by:
//         </span>
//         {groupByOptions.map((option) => (
//           <Button
//             key={option}
//             variant={selectedGroupBy === option ? "default" : "outline"}
//             size="sm"
//             onClick={() => setSelectedGroupBy(option)}
//             className={
//               selectedGroupBy === option
//                 ? "bg-blue-500 text-white hover:bg-blue-600"
//                 : ""
//             }
//           >
//             {option}
//           </Button>
//         ))}
//       </div>

//       <div className="flex justify-end items-center">
//         <Button variant="ghost" size="sm" className="text-gray-600">
//           <span className="mr-2">↓</span> 1 – {tableData.length} of{" "}
//           {tableData.length}
//         </Button>
//       </div>

//       {/* Data Table */}
//       <div className="border rounded-lg overflow-hidden">
//         <table className="w-full">
//           <thead className="bg-gray-50 border-b">
//             <tr>
//               <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
//                 {selectedGroupBy}
//                 <span className="ml-1 text-gray-400">⇅</span>
//               </th>
//               <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
//                 Assigned
//                 <span className="ml-1 text-gray-400">⇅</span>
//               </th>
//               <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
//                 Completed
//                 <span className="ml-1 text-gray-400">⇅</span>
//               </th>
//               <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
//                 Completed Ratio
//                 <span className="ml-1 text-gray-400">⇅</span>
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {tableData.length === 0 ? (
//               <tr>
//                 <td colSpan={4} className="text-center py-8 text-gray-500">
//                   No data available
//                 </td>
//               </tr>
//             ) : (
//               tableData.map((row, idx) => (
//                 <tr key={idx} className="border-b hover:bg-gray-50">
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
//                         {row.name.charAt(0).toUpperCase()}
//                       </div>
//                       <span className="font-medium">{row.name}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-blue-600 font-medium">
//                     {row.assigned}
//                   </td>
//                   <td className="px-6 py-4 text-blue-600 font-medium">
//                     {row.completed}
//                   </td>
//                   <td className="px-6 py-4 text-blue-600 font-medium">
//                     {row.completedRatio}%
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

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

export function CreatedVsCompletedDetail({ filters, dateRange }: Props) {
  const [selectedGroupBy, setSelectedGroupBy] = useState<GroupBy>("Location");

  const apiFilters = useMemo(() => {
    return mapFilters(filters, dateRange);
  }, [filters, dateRange]);

  // Fetch chart data (total created and completed)
  const { data: chartData, loading: chartLoading } = useQuery<{
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

  // Fetch grouped data for table
  const { data, loading } = useQuery<{
    getChartData: Array<{ groupValues: string[]; value: number }>;
  }>(GET_CHART_DATA, {
    variables: {
      input: {
        dataset: "WORK_ORDERS",
        groupByFields: [groupByFieldMap[selectedGroupBy], "status"],
        metric: "COUNT",
        filters: apiFilters,
      },
    },
    fetchPolicy: "cache-and-network",
    skip: !groupByFieldMap[selectedGroupBy],
  });

  // Calculate total created and completed
  const totals = useMemo(() => {
    if (!chartData?.getChartData) return { created: 0, completed: 0 };

    let created = 0;
    let completed = 0;

    chartData.getChartData.forEach((item) => {
      const [status] = item.groupValues || [];
      created += item.value;

      const statusLower = status?.toLowerCase();
      if (statusLower === "done" || statusLower === "completed") {
        completed += item.value;
      }
    });

    return { created, completed };
  }, [chartData]);

  // Process data into table format
  const tableData = useMemo(() => {
    if (!data?.getChartData) return [];

    console.log(
      `[CreatedVsCompleted] Data for ${selectedGroupBy}:`,
      data.getChartData
    );

    const grouped = new Map<
      string,
      {
        name: string;
        created: number;
        assigned: number;
        completed: number;
        completedRatio: number;
      }
    >();

    data.getChartData.forEach((item) => {
      const [groupName, status] = item.groupValues || [];

      if (
        !groupName ||
        groupName === "Unassigned" ||
        groupName === "null" ||
        groupName === "undefined"
      ) {
        return;
      }

      if (!grouped.has(groupName)) {
        grouped.set(groupName, {
          name: groupName,
          created: 0,
          assigned: 0,
          completed: 0,
          completedRatio: 0,
        });
      }

      const entry = grouped.get(groupName)!;
      const statusLower = status?.toLowerCase();

      entry.created += item.value;

      if (status && statusLower !== "unassigned") {
        entry.assigned += item.value;
      }

      if (statusLower === "done" || statusLower === "completed") {
        entry.completed += item.value;
      }
    });

    return Array.from(grouped.values())
      .filter((entry) => entry.created > 0)
      .map((entry) => ({
        ...entry,
        completedRatio:
          entry.assigned > 0
            ? Math.round((entry.completed / entry.assigned) * 100)
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
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Created vs. Completed</h3>
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-gray-300"
          >
            <span className="text-xl">+</span>
          </Button>
        </div>

        {/* Stats and Chart Layout */}
        <div className="flex items-start gap-8">
          {/* Left Side: Stats - Side by Side */}
          <div className="flex gap-8">
            {/* Created Stat */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {totals.created}
              </span>
              <div className="px-4 py-1.5 border-2 border-blue-400 rounded-md bg-blue-50 text-blue-600 font-semibold text-sm whitespace-nowrap">
                Created
              </div>
            </div>

            {/* Completed Stat */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {totals.completed}
              </span>
              <div className="px-4 py-1.5 border-2 border-teal-400 rounded-md bg-teal-50 text-teal-600 font-semibold text-sm whitespace-nowrap">
                Completed
              </div>
            </div>
          </div>

          {/* Right Side: Chart - Smaller */}
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={[
                  {
                    date: dateRange.startDate,
                    Created: totals.created,
                    Completed: 0,
                  },
                  {
                    date: dateRange.endDate,
                    Created: totals.created,
                    Completed: totals.completed,
                  },
                ]}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "10px" }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="Created"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="Completed"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ fill: "#14b8a6", r: 4, strokeWidth: 0 }}
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
                Assigned
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Completed
                <span className="ml-1 text-gray-400">⇅</span>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                Completed Ratio
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
                    {row.assigned}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.completed}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {row.completedRatio}%
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