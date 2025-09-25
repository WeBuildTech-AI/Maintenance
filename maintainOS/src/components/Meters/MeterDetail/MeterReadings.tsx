import { Plus } from "lucide-react";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "../../ui/button";
import { mockReadingData } from "../mockData";

export function MeterReadings({ selectedMeter }: any) {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1W");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Readings</h2>
        <div className="flex items-center gap-1">
          {["1H", "1D", "1W", "1M", "3M", "6M", "1Y", "Custom"].map((period) => (
            <Button
              key={period}
              variant={selectedTimePeriod === period ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTimePeriod(period)}
              className={selectedTimePeriod === period ? "bg-orange-600 hover:bg-orange-700" : ""}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground">{selectedMeter.unit}</div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockReadingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
              <YAxis domain={[15, 55]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
              <Tooltip />
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

        {/* See All Readings Button */}
        <div className="pt-4">
          <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4" />
            See All Readings
          </Button>
        </div>
      </div>
    </div>
  );
}
