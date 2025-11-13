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
  LabelList,
} from "recharts";
import { Button } from "../../ui/button";
import { subHours, subDays, subWeeks, subMonths, isAfter } from "date-fns";
export function MeterReadings({ selectedMeter, setShowReadingMeter }: any) {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1D");
  const [customRange, setCustomRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const readings = selectedMeter?.readings || [];

  // ✅ Convert timestamps -> numeric for recharts
  const formattedData = useMemo(
    () =>
      readings.map((r: any) => ({
        ...r,
        date: new Date(r.timestamp).getTime(), // 🔥 numeric timestamp
      })),
    [readings]
  );

  // ✅ Filter dynamically
  const filteredData = useMemo(() => {
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
        if (customRange.start && customRange.end) {
          startDate = customRange.start;
          endDate = customRange.end;
          break;
        } else return [];
      default:
        startDate = new Date(0);
    }

    const filtered = formattedData.filter(
      (d) => isAfter(new Date(d.date), startDate) && d.date <= endDate.getTime()
    );

    return filtered.length > 0 ? filtered : formattedData;
  }, [selectedTimePeriod, formattedData, customRange]);

  // ✅ Dynamic Y-axis
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

  // ✅ Custom date input
  const handleCustomDateSelect = () => {
    const start = prompt("Enter start date (YYYY-MM-DD):");
    const end = prompt("Enter end date (YYYY-MM-DD):");
    if (start && end) {
      setCustomRange({ start: new Date(start), end: new Date(end) });
      setSelectedTimePeriod("Custom");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Readings</h2>
        <div className="flex items-center gap-1 flex-wrap">
          {["1H", "1D", "1W", "1M", "3M", "6M", "1Y", "Custom"].map((period) => (
            <Button
              key={period}
              size="sm"
              onClick={() => {
                if (period === "Custom") handleCustomDateSelect();
                else setSelectedTimePeriod(period);
              }}
              className={`${
                selectedTimePeriod === period
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-transparent hover:bg-gray-100 text-gray-600"
              } transition-all duration-200`}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground">
          {selectedMeter?.unit || ""}
        </div>

        <div className="h-80 w-full transition-all duration-300">
          {filteredData.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              No data for this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                key={`${selectedTimePeriod}-${filteredData.length}-${minValue}-${maxValue}`}
                data={filteredData}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                {/* ✅ FIXED X-AXIS */}
                <XAxis
                  dataKey="date"
                  type="number"
                  domain={["dataMin", "dataMax"]}
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
                        return date.toLocaleDateString("en-IN", {
                          month: "short",
                          year: "2-digit",
                        });
                      case "1Y":
                        return date.toLocaleDateString("en-IN", {
                          month: "short",
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

                {/* ✅ FIXED Y-AXIS */}
                <YAxis
                  domain={[minValue, maxValue]}
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

                {/* ✅ Line + Labels fixed */}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                  isAnimationActive
                  animationDuration={500}
                >
                  <LabelList
                    dataKey="value"
                    position="top"
                    className="text-xs"
                    formatter={(v: number) => v.toString()}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          )}
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
