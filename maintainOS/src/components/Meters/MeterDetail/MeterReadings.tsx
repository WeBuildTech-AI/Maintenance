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
import { CustomDateRangeModal } from "../../utils/CustomDateRangeModal";

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

  // ✅ NEW LOGIC: Clean Intervals (No Duplicates)
  const allTicks = useMemo(() => {
    const [start, end] = domainRange;
    const ticks = [];

    // Calculate time difference
    const diff = end - start;
    const ONE_MINUTE = 60 * 1000;
    const ONE_HOUR = 60 * ONE_MINUTE;
    const ONE_DAY = 24 * ONE_HOUR;

    let step = ONE_DAY; // Default to 1 Day

    // Step calculation logic
    if (selectedTimePeriod === "1H") {
      step = 10 * ONE_MINUTE; // 1 Hour view: 10 min ticks
    } else if (
      selectedTimePeriod === "1D" ||
      (selectedTimePeriod === "Custom" && diff <= 2 * ONE_DAY)
    ) {
      step = 4 * ONE_HOUR; // 1-2 Days view: 4 Hour ticks
    } else if (diff <= 30 * ONE_DAY) {
      step = ONE_DAY; // < 1 Month: 1 Day ticks (Clean Daily Labels)
    } else if (diff <= 180 * ONE_DAY) {
      step = 15 * ONE_DAY; // < 6 Months: 15 Day ticks
    } else {
      step = 30 * ONE_DAY; // > 6 Months: Monthly ticks
    }

    // Loop generation
    let current = start;

    if (step >= ONE_DAY) {
      const d = new Date(start);
      d.setHours(0, 0, 0, 0);
      current = d.getTime();
    }

    while (current <= end) {
      if (current >= start) {
        ticks.push(current);
      }
      current += step;
    }

    return ticks;
  }, [domainRange, selectedTimePeriod]);

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
                const currentYear = new Date().getFullYear();
                const dateYear = date.getFullYear();
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
                    // Check if the date's year matches the current real-world year
                    const isCurrentYear = dateYear === currentYear;

                    return date.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      // If it's the current year, pass 'undefined' (hidden), else show '2-digit' (e.g., 24, 25)
                      year: isCurrentYear ? undefined : "2-digit",
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
