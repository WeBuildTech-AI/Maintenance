import { Plus } from "lucide-react";
import { useState, useMemo } from "react";
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
import { Avatar } from "../../ui/avatar";

export function MeterReadings({
  selectedMeter,
  setShowReadingMeter,
  hideSeeReadingFlag,
}: any) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1H");

  const [customRange, setCustomRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  const readings = selectedMeter?.readings || [];

  // Convert timestamps
  const formattedData = useMemo(
    () =>
      readings.map((r: any) => ({
        ...r,
        date: new Date(r.timestamp).getTime(),
      })),
    [readings]
  );

  // Calculate domain range
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

  // Filtered data
  const filteredData = useMemo(() => {
    const [startTime, endTime] = domainRange;
    return formattedData.filter(
      (d) => d.date >= startTime && d.date <= endTime
    );
  }, [formattedData, domainRange]);

  // Y-axis dynamic
  const { minValue, maxValue } = useMemo(() => {
    if (filteredData.length === 0) return { minValue: 0, maxValue: 100 };
    const values = filteredData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 10;
    return {
      minValue: Math.max(0, min - range * 0.1),
      maxValue: max + range * 0.1,
    };
  }, [filteredData]);

  // ⬇️ FIX → No more "0" dot when no data
  const safeData =
    filteredData.length > 0
      ? filteredData
      : [{ date: domainRange[0], value: undefined }];

  return (
    <div
      className={`${
        hideSeeReadingFlag === false ? "p-4" : ""
      } bg-white rounded-lg shadow`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {hideSeeReadingFlag === false ? (
          <h2 className="text-lg font-medium">
            {selectedMeter.measurement && selectedMeter.measurement.name}
          </h2>
        ) : (
          <h2 className="text-lg font-medium">Readings</h2>
        )}

        <div className="flex items-center gap-1 flex-wrap">
          {["1H", "1D", "1W", "1M", "3M", "6M", "1Y", "Custom"].map(
            (period) => (
              <Button
                key={period}
                size="sm"
                onClick={() => {
                  if (period === "Custom") {
                    // const start = prompt("Enter start date (YYYY-MM-DD):");
                    // const end = prompt("Enter end date (YYYY-MM-DD):");
                    // if (start && end) {
                    //   setCustomRange({
                    //     start: new Date(start),
                    //     end: new Date(end),
                    //   });
                    //   setSelectedTimePeriod("Custom");
                    // }
                  } else {
                    setSelectedTimePeriod(period);
                  }
                }}
                className={`${
                  selectedTimePeriod === period
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-transparent hover:bg-gray-100 text-gray-600"
                }`}
              >
                {period}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full transition-all duration-300">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            key={`${selectedTimePeriod}-${safeData.length}-${minValue}-${maxValue}`}
            data={safeData}
            margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#c9c8c8ff" />

            {/* Restored old date formatting */}
            <XAxis
              dataKey="date"
              type="number"
              domain={domainRange}
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
                    return date.toLocaleString("en-IN", {
                      weekday: "short",
                      hour: "2-digit",
                      hour12: true,
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
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
            />

            <YAxis
              domain={[minValue, maxValue]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#FFCD00"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Button */}
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
              {/* <Avatar>
                {}
              </Avatar> */}
              {user?.fullName}
            </div>
            <div className="border-b mt-2"></div>
          </div>

          {/* Last Reading Value */}
          <div>
            <div className="text-gray-500 text-sm">Last Reading Value :- </div>
            <div className="font-medium text-[15px] mt-1">
              {/* {`${meter.readingValue} PSI, ${meter.date}, ${meter.time}`} */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
