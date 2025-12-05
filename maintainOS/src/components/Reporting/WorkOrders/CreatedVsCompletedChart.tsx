import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Info, ChevronRight, Plus } from "lucide-react";

// Mock data for Created vs Completed chart
const createdVsCompletedData = [
  { date: "9/28/2025", created: 0, completed: 0 },
  { date: "10/5/2025", created: 0, completed: 0 },
  { date: "10/12/2025", created: 0, completed: 0 },
  { date: "10/19/2025", created: 0, completed: 0 },
  { date: "10/26/2025", created: 0, completed: 0 },
  { date: "11/2/2025", created: 0, completed: 0 },
  { date: "11/9/2025", created: 0, completed: 0 },
  { date: "11/16/2025", created: 0, completed: 0 },
  { date: "11/23/2025", created: 0, completed: 0 },
  { date: "11/30/2025", created: 0, completed: 0 },
  { date: "12/7/2025", created: 2, completed: 0 },
];

export function CreatedVsCompletedChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Created vs. Completed
          </CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
          <ChevronRight className="h-4 w-4 text-blue-500" />
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mb-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">2</div>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Created
            </Button>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">0</div>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              Completed
            </Button>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">
              0.0<span className="text-3xl">%</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">Percent Completed</div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={createdVsCompletedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="created"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Created"
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
