import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Info, Plus, ChevronRight } from "lucide-react";

// Static data for now - will be replaced with GraphQL later
const STATIC_DATA = [
  { reason: "Inspection", failures: 3, cumulativePercent: 37.5 },
  { reason: "Planned Maintenance", failures: 2, cumulativePercent: 62.5 },
  { reason: "Tool Failure", failures: 2, cumulativePercent: 87.5 },
  { reason: "Unspecified", failures: 1, cumulativePercent: 100 },
];

export function DowntimeReasonsChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Unplanned Downtime Reasons
          </CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
          <ChevronRight className="h-4 w-4 text-blue-500 cursor-pointer hover:bg-gray-100 rounded" />
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            REFERENCE
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span>Failures</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Cumulative total</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart
            data={STATIC_DATA}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="reason"
              tick={{ fontSize: 11 }}
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              label={{
                value: "FAILURES",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 10, fill: "#666" },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="failures"
              fill="#f87171"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulativePercent"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{ r: 4, fill: "#60a5fa" }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
