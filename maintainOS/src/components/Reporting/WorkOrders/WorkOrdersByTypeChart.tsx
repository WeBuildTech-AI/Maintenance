import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Info, ChevronRight, Plus } from "lucide-react";

// Mock data for Work Orders by Type
const workOrdersByTypeData = [
  { date: "9/28/2025", preventive: 0, reactive: 0, other: 0 },
  { date: "10/5/2025", preventive: 0, reactive: 0, other: 0 },
  { date: "10/12/2025", preventive: 0, reactive: 0, other: 0 },
  { date: "10/19/2025", preventive: 0, reactive: 0, other: 0 },
  { date: "10/26/2025", preventive: 0, reactive: 0, other: 0 },
  { date: "11/2/2025", preventive: 0, reactive: 0, other: 0 },
  { date: "11/9/2025", preventive: 0, reactive: 0, other: 0 },
  { date: "11/16/2025", preventive: 0, reactive: 0, other: 0 },
  { date: "11/23/2025", preventive: 0, reactive: 0, other: 0 },
  { date: "11/30/2025", preventive: 0, reactive: 0, other: 0 },
  { date: "12/7/2025", preventive: 0, reactive: 2, other: 0 },
];

export function WorkOrdersByTypeChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Work Orders by Type
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
        <div className="grid grid-cols-4 gap-6 mb-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">0</div>
            <Button
              variant="outline"
              size="sm"
              className="text-teal-600 border-teal-300 hover:bg-teal-50"
            >
              Preventive
            </Button>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">2</div>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Reactive
            </Button>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">0</div>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Other
            </Button>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-3">
              0.0<span className="text-3xl">%</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Total Preventive Ratio
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workOrdersByTypeData}>
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
            <Bar
              dataKey="preventive"
              fill="#14b8a6"
              name="Preventive"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="reactive"
              fill="#3b82f6"
              name="Reactive"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="other"
              fill="#9ca3af"
              name="Other"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
