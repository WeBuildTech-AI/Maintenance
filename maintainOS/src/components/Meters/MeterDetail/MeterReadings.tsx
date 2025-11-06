// import { Plus } from "lucide-react";
// import { useState } from "react";
// import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
// import { Button } from "../../ui/button";
// import { mockReadingData } from "../mockData";

// export function MeterReadings({ selectedMeter }: any) {
//   const [selectedTimePeriod, setSelectedTimePeriod] = useState("1W");

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-lg font-medium">Readings</h2>
//         <div className="flex items-center gap-1">
//           {["1H", "1D", "1W", "1M", "3M", "6M", "1Y", "Custom"].map((period) => (
//             <Button
//               key={period}
//               variant={selectedTimePeriod === period ? "default" : "ghost"}
//               size="sm"
//               onClick={() => setSelectedTimePeriod(period)}
//               className={selectedTimePeriod === period ? "bg-orange-600 hover:bg-orange-700" : ""}
//             >
//               {period}
//             </Button>
//           ))}
//         </div>
//       </div>

//       {/* Chart */}
//       <div className="space-y-4">
//         <div className="text-sm font-medium text-muted-foreground">{selectedMeter.unit}</div>
//         <div className="h-80 w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={mockReadingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
//               <YAxis domain={[15, 55]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
//               <Tooltip />
//               <Line
//                 type="monotone"
//                 dataKey="value"
//                 stroke="#3b82f6"
//                 strokeWidth={2}
//                 dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
//                 activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* See All Readings Button */}
//         <div className="pt-4">
//           <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
//             <Plus className="h-4 w-4" />
//             See All Readings
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { Plus } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../../ui/button";
import { mockReadingData } from "../mockData";
import toast from "react-hot-toast";
import { subHours, subDays, subWeeks, subMonths, isAfter } from "date-fns";

export function MeterReadings({ selectedMeter, setShowReadingMeter }: any) {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1D");

  // 🔹 1. Filtering based on time period
  const getFilteredData = () => {
    const now = new Date();
    let startDate;

    switch (selectedTimePeriod) {
      case "1H":
        startDate = subHours(now, 1);
        break;
      case "1D":
        startDate = subDays(now, 1);
        break;
      case "1W":
        startDate = subWeeks(now, 1);
        break;
      case "1M":
        startDate = subMonths(now, 1);
        break;
      case "3M":
        startDate = subMonths(now, 3);
        break;
      case "6M":
        startDate = subMonths(now, 6);
        break;
      case "1Y":
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = new Date(0);
    }

    // Filter data
    const filtered = mockReadingData.filter((d) =>
      isAfter(new Date(d.date), startDate)
    );

    // 🧠 If nothing matches (old timestamps), show all data instead
    return filtered.length > 0 ? filtered : mockReadingData;
  };

  const filteredData = getFilteredData();

  // 🔹 2. Auto-scale Y axis
  const maxValue = Math.max(...filteredData.map((d) => d.value));
  const roundedMax = Math.ceil(maxValue / 50) * 50;

  // 🔹 3. Chart rendering
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Readings</h2>
        <div className="flex items-center gap-1 flex-wrap">
          {["1H", "1D", "1W", "1M", "3M", "6M", "1Y", "Custom"].map(
            (period) => (
              <Button
                key={period}
                variant={selectedTimePeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTimePeriod(period)}
                className={
                  selectedTimePeriod === period
                    ? "bg-orange-600 hover:bg-orange-700"
                    : ""
                }
              >
                {period}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground">
          {selectedMeter.unit}
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (selectedTimePeriod === "1H")
                    return date.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  if (["1D", "1W"].includes(selectedTimePeriod))
                    return date.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                    });
                  return date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  });
                }}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
              />
              <YAxis
                domain={[0, roundedMax]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value} ${selectedMeter.unit}`,
                  "Reading",
                ]}
                labelFormatter={(label: string) =>
                  new Date(label).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Button */}
        <div className="pt-4">
          <Button
            className="gap-2 bg-orange-600 hover:bg-orange-700"
            onClick={() => setShowReadingMeter(true)}
          >
            <Plus className="h-4 w-4" />
            See All Readings
          </Button>
        </div>
      </div>
    </div>
  );
}
