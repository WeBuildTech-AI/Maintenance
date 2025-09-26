import { Info } from "lucide-react";

interface DayTotal {
  key: string;        // unique key, e.g. "2025-02-17"
  day: string;        // e.g. "Monday"
  label: string;      // e.g. "17"
  isToday: boolean;
  utilization: number; // 0–100
}

interface CapacityOverviewProps {
  totalScheduledHours: number;
  totalCapacity: number;
  averageUtilization: number; // 0–100
  dailyTotals: DayTotal[];
  gridTemplateColumns: string;
}

export function CapacityOverview({
  totalScheduledHours,
  totalCapacity,
  averageUtilization,
  dailyTotals,
  gridTemplateColumns,
}: CapacityOverviewProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card mb-4">
      {/* Header row uses the SAME grid as TeamGrid */}
      <div
        className="grid min-w-[800px] border-b border-border"
        style={{ gridTemplateColumns }}
      >
        {/* Left summary column */}
        <div className="p-4">
          <div className="flex items-start gap-1 mb-1">
            <span className="text-sm font-medium text-foreground">
              Total Resource Capacity
            </span>
            <Info className="h-3 w-3 text-muted-foreground mt-0.5" />
          </div>

          <div className="text-sm text-muted-foreground mb-2">
            <span className="font-medium text-foreground">
              {totalScheduledHours}h
            </span>
            <span> / {totalCapacity}h Capacity</span>
          </div>

          {/* Progress summary */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="w-full bg-blue-100 h-3 rounded-sm overflow-hidden">
                <div
                  className="bg-orange-600 h-3 rounded-sm"
                  style={{ width: `${Math.min(averageUtilization, 100)}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-muted-foreground ml-1">
              {averageUtilization}%
            </span>
          </div>
        </div>

        {/* Day headers */}
        {dailyTotals.map((day) => (
          <div
            key={day.key}
            className={`border-l p-4 flex flex-col justify-between ${
              day.isToday ? "bg-primary/5" : ""
            }`}
          >
            {/* Day + Date */}
            <div className="flex items-center justify-between mb-2">
              <div
                className={`text-sm font-medium ${
                  day.isToday ? "text-primary" : "text-foreground"
                }`}
              >
                {day.day}
              </div>
              <div
                className={`text-xs ${
                  day.isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {day.label}
              </div>
            </div>

            {/* Rounded progress bar at bottom */}
            <div className="mt-auto w-full bg-blue-100 h-6 border border-gray-300 rounded-sm relative overflow-hidden">
              {/* Fill */}
              <div
                className="absolute left-0 top-0 h-full bg-orange-600 rounded-sm"
                style={{ width: `${Math.min(day.utilization, 100)}%` }}
              />
              {/* Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-black">
                  {day.utilization}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
