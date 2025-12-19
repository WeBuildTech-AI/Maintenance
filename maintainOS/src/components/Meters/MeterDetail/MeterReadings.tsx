// import { Plus } from "lucide-react";
// import { useState, useMemo, useRef } from "react";
// import {
//   CartesianGrid,
//   Line,
//   LineChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { Button } from "../../ui/button";
// import { subHours, subDays, subWeeks, subMonths } from "date-fns";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../../store";
// import { CustomDateRangeModal } from "./CustomDateRangeModal";

// export function MeterReadings({
//   selectedMeter,
//   setShowReadingMeter,
//   hideSeeReadingFlag,
// }: any) {
//   const user = useSelector((state: RootState) => state.auth.user);
//   const [selectedTimePeriod, setSelectedTimePeriod] = useState("1H");
//   const [isCustomOpen, setIsCustomOpen] = useState(false);
//   const customBtnRef = useRef<HTMLDivElement>(null);

//   const [customRange, setCustomRange] = useState<{
//     start: Date | null;
//     end: Date | null;
//   }>({
//     start: null,
//     end: null,
//   });

//   const readings = selectedMeter?.readings || [];

//   const formattedData = useMemo(
//     () =>
//       readings.map((r: any) => ({
//         ...r,
//         date: new Date(r.timestamp).getTime(),
//       })),
//     [readings]
//   );

//   const domainRange = useMemo(() => {
//     const now = new Date();
//     let startDate: Date;
//     let endDate = now;

//     switch (selectedTimePeriod) {
//       case "1H":
//         startDate = subHours(now, 1);
//         break;
//       case "1D":
//         startDate = subDays(now, 1);
//         break;
//       case "1W":
//         startDate = subWeeks(now, 1);
//         break;
//       case "1M":
//         startDate = subMonths(now, 1);
//         break;
//       case "3M":
//         startDate = subMonths(now, 3);
//         break;
//       case "6M":
//         startDate = subMonths(now, 6);
//         break;
//       case "1Y":
//         startDate = subMonths(now, 12);
//         break;
//       case "Custom":
//         startDate = customRange.start || subDays(now, 1);
//         endDate = customRange.end || now;
//         break;
//       default:
//         startDate = subDays(now, 1);
//     }

//     return [startDate.getTime(), endDate.getTime()];
//   }, [selectedTimePeriod, customRange]);

//   const filteredData = useMemo(() => {
//     const [startTime, endTime] = domainRange;
//     return formattedData.filter(
//       (d: any) => d.date >= startTime && d.date <= endTime
//     );
//   }, [formattedData, domainRange]);

//   const { minValue, maxValue } = useMemo(() => {
//     if (filteredData.length === 0) return { minValue: 0, maxValue: 100 };
//     const values = filteredData.map((d: any) => d.value);
//     const min = Math.min(...values);
//     const max = Math.max(...values);
//     const range = max - min || 10;
//     return {
//       minValue: Math.max(0, min - range * 0.1),
//       maxValue: max + range * 0.1,
//     };
//   }, [filteredData]);

//   const safeData =
//     filteredData.length > 0
//       ? filteredData
//       : [{ date: domainRange[0], value: undefined }];

//   const handleCustomDateApply = (start: Date, end: Date) => {
//     setCustomRange({ start, end });
//     setSelectedTimePeriod("Custom");
//     setIsCustomOpen(false);
//   };

//   return (
//     <div className=" rounded-lg shadow relative p-4">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-lg font-medium">
//           {selectedMeter?.measurement?.name || "Readings"}
//         </h2>

//         <div className="flex items-center gap-1 flex-wrap relative">
//           {["1H", "1D", "1W", "1M", "3M", "6M", "1Y"].map((period) => (
//             <Button
//               key={period}
//               size="sm"
//               onClick={() => setSelectedTimePeriod(period)}
//               className={
//                 selectedTimePeriod === period
//                   ? "bg-orange-600 text-white"
//                   : "bg-transparent text-gray-600"
//               }
//             >
//               {period}
//             </Button>
//           ))}

//           {/* Custom Button */}
//           <div ref={customBtnRef}>
//             <Button
//               size="sm"
//               onClick={() => setIsCustomOpen((s) => !s)}
//               className={
//                 selectedTimePeriod === "Custom"
//                   ? "bg-orange-600 text-white"
//                   : "bg-transparent text-gray-600"
//               }
//             >
//               Custom
//             </Button>
//           </div>

//           {isCustomOpen && (
//             <CustomDateRangeModal
//               anchorRef={customBtnRef}
//               onApply={handleCustomDateApply}
//               onClose={() => setIsCustomOpen(false)}
//             />
//           )}
//         </div>
//       </div>

//       {/* Chart */}
//       <div className="h-80">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={safeData}>
//             <CartesianGrid strokeDasharray="3 3" />

//             {/* ✅ X-AXIS EXACT SAME AS BEFORE */}
//             <XAxis
//               dataKey="date"
//               type="number"
//               domain={domainRange}
//               tickFormatter={(value) => {
//                 const date = new Date(value);
//                 switch (selectedTimePeriod) {
//                   case "1H":
//                     return date.toLocaleTimeString("en-IN", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     });
//                   case "1D":
//                     return date.toLocaleTimeString("en-IN", {
//                       hour: "2-digit",
//                       hour12: true,
//                     });
//                   case "1W":
//                     return date.toLocaleString("en-IN", {
//                       weekday: "short",
//                       hour: "2-digit",
//                       hour12: true,
//                     });
//                   case "1M":
//                   case "3M":
//                     return date.toLocaleDateString("en-IN", {
//                       day: "2-digit",
//                       month: "short",
//                     });
//                   case "6M":
//                   case "1Y":
//                     return date.toLocaleDateString("en-IN", {
//                       month: "short",
//                       year: "2-digit",
//                     });
//                   case "Custom":
//                     return date.toLocaleDateString("en-IN", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "2-digit",
//                     });
//                   default:
//                     return date.toLocaleString("en-IN");
//                 }
//               }}
//             />

//             <YAxis domain={[minValue, maxValue]} />
//             <Tooltip
//               labelFormatter={(value) =>
//                 new Date(value).toLocaleString("en-IN")
//               }
//             />

//             <Line dataKey="value" stroke="#FFCD00" strokeWidth={2} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//       {hideSeeReadingFlag === false ? null : (
//         <div className="pt-4">
//           <Button
//             className="gap-2 bg-orange-600 hover:bg-orange-700"
//             onClick={() => setShowReadingMeter(true)}
//           >
//             <Plus className="h-4 w-4" />
//             See All Readings
//           </Button>
//         </div>
//       )}
//       {hideSeeReadingFlag === false && (
//         <div className="space-y-3 mt-2 text-orange-600">
//           <div className="flex item-center">
//             <div className="flex items-center  gap-2 text-[15px] mt-1">
//               <div className=" text-sm ">Source :- </div>
//               {user?.fullName}
//             </div>
//             <div className="border-b mt-2"></div>
//           </div>

//           <div>
//             <div className="text-gray-500 text-sm">Last Reading Value :- </div>
//             <div className="font-medium text-[15px] mt-1">
//               {readings.length > 0 ? readings[0].value : "N/A"}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { Plus } from "lucide-react";
import { useState, useMemo, useRef } from "react";
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
import { subHours, subDays, subWeeks, subMonths } from "date-fns";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { CustomDateRangeModal } from "./CustomDateRangeModal";

export function MeterReadings({
  selectedMeter,
  setShowReadingMeter,
  hideSeeReadingFlag,
}: any) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1H");
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const customBtnRef = useRef<HTMLDivElement>(null);

  const [customRange, setCustomRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  const readings = selectedMeter?.readings || [];

  const formattedData = useMemo(
    () =>
      readings.map((r: any) => ({
        ...r,
        date: new Date(r.timestamp).getTime(),
      })),
    [readings]
  );

  // 1. Domain Range Calculation
  const domainRange = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

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
      case "Custom":
        startDate = customRange.start || subDays(now, 1);
        endDate = customRange.end || now;
        break;
      default:
        startDate = subDays(now, 1);
    }

    return [startDate.getTime(), endDate.getTime()];
  }, [selectedTimePeriod, customRange]);

  const filteredData = useMemo(() => {
    const [startTime, endTime] = domainRange;
    return formattedData.filter(
      (d: any) => d.date >= startTime && d.date <= endTime
    );
  }, [formattedData, domainRange]);

  // ✅ NEW LOGIC: Merge Background Ticks + Data Ticks
  const allTicks = useMemo(() => {
    const [start, end] = domainRange;
    const ticks = new Set<number>();

    // Step A: Add Data Points (Taaki reading wali date zaroor dikhe)
    filteredData.forEach((d: any) => ticks.add(d.date));

    // Step B: Add Interval Ticks (Taaki poori range/gap fill ho jaye)
    let step = 0;
    const MINUTE = 60 * 1000;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;

    // Har period ke liye gap decide karo
    switch (selectedTimePeriod) {
      case "1H":
        step = 10 * MINUTE;
        break; // Har 10 min pe tick
      case "1D":
        step = 4 * HOUR;
        break; // Har 4 ghante pe tick
      case "1W":
        step = 1 * DAY;
        break; // Har din tick (Mon, Tue...)
      case "1M":
        step = 5 * DAY;
        break; // Har 5 din pe
      case "3M":
        step = 15 * DAY;
        break; // Har 15 din pe
      case "6M":
        step = 30 * DAY;
        break; // Har mahine
      case "1Y":
        step = 60 * DAY;
        break; // Har 2 mahine
      case "Custom":
        // Custom ke liye dynamic step
        const diff = end - start;
        step = diff / 6; // Total range ko 6 hisso mein baato
        break;
      default:
        step = 1 * DAY;
    }

    // Loop chala ke ticks bharo
    if (step > 0) {
      for (let current = start; current <= end; current += step) {
        ticks.add(current);
      }
    }

    // Array mein convert karke sort karo
    return Array.from(ticks).sort((a, b) => a - b);
  }, [domainRange, filteredData, selectedTimePeriod]);

  const { minValue, maxValue } = useMemo(() => {
    if (filteredData.length === 0) return { minValue: 0, maxValue: 100 };
    const values = filteredData.map((d: any) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 10;
    return {
      minValue: Math.max(0, min - range * 0.1),
      maxValue: max + range * 0.1,
    };
  }, [filteredData]);

  const safeData =
    filteredData.length > 0
      ? filteredData
      : [{ date: domainRange[0], value: undefined }];

  const handleCustomDateApply = (start: Date, end: Date) => {
    setCustomRange({ start, end });
    setSelectedTimePeriod("Custom");
    setIsCustomOpen(false);
  };

  return (
    <div className=" rounded-lg shadow relative p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">
          {selectedMeter?.measurement?.name || "Readings"}
        </h2>

        <div className="flex items-center gap-1 flex-wrap relative">
          {["1H", "1D", "1W", "1M", "3M", "6M", "1Y"].map((period) => (
            <Button
              key={period}
              size="sm"
              onClick={() => setSelectedTimePeriod(period)}
              className={
                selectedTimePeriod === period
                  ? "bg-orange-600 text-white"
                  : "bg-transparent text-gray-600"
              }
            >
              {period}
            </Button>
          ))}

          {/* Custom Button */}
          <div ref={customBtnRef}>
            <Button
              size="sm"
              onClick={() => setIsCustomOpen((s) => !s)}
              className={
                selectedTimePeriod === "Custom"
                  ? "bg-orange-600 text-white"
                  : "bg-transparent text-gray-600"
              }
            >
              Custom
            </Button>
          </div>

          {isCustomOpen && (
            <CustomDateRangeModal
              anchorRef={customBtnRef}
              onApply={handleCustomDateApply}
              onClose={() => setIsCustomOpen(false)}
            />
          )}
        </div>
      </div>

      {selectedTimePeriod === "Custom" &&
        customRange.start &&
        customRange.end && (
          <div className="mb-3 rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <span className="font-medium">Selected Range:</span>{" "}
            {customRange.start.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}{" "}
            –{" "}
            {customRange.end.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        )}
      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              type="number"
              domain={domainRange}
              ticks={allTicks} // 👈 Updated: Uses merged ticks (Interval + Data)
              interval="preserveStartEnd" // Overlapping labels ko handle karega
              tickFormatter={(value) => {
                const date = new Date(value);
                switch (selectedTimePeriod) {
                  case "1H":
                    return date.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  case "1D":
                    return date.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      hour12: true,
                    });
                  case "1W":
                    // Shows "Mon 12" format
                    return date.toLocaleString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                    });
                  case "1M":
                  case "3M":
                    return date.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    });
                  case "6M":
                  case "1Y":
                    return date.toLocaleDateString("en-IN", {
                      month: "short",
                      year: "2-digit",
                    });
                  case "Custom":
                    return date.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    });
                  default:
                    return date.toLocaleString("en-IN");
                }
              }}
            />

            <YAxis domain={[minValue, maxValue]} />
            <Tooltip
              labelFormatter={(value) =>
                new Date(value).toLocaleString("en-IN")
              }
            />

            <Line dataKey="value" stroke="#FFCD00" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {hideSeeReadingFlag === false ? null : (
        <div className="pt-4">
          <Button
            className="gap-2 bg-orange-600 hover:bg-orange-700"
            onClick={() => setShowReadingMeter(true)}
          >
            <Plus className="h-4 w-4" />
            See All Readings
          </Button>
        </div>
      )}
      {hideSeeReadingFlag === false && (
        <div className="space-y-3 mt-2 text-orange-600">
          <div className="flex item-center">
            <div className="flex items-center  gap-2 text-[15px] mt-1">
              <div className=" text-sm ">Source :- </div>
              {user?.fullName}
            </div>
            <div className="border-b mt-2"></div>
          </div>

          <div>
            <div className="text-gray-500 text-sm">Last Reading Value :- </div>
            <div className="font-medium text-[15px] mt-1">
              {readings.length > 0 ? readings[0].value : "N/A"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
