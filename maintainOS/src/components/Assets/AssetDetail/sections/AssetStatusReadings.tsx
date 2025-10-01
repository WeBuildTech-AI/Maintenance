import { Calendar, ChevronRight } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store";
import { formatFriendlyDate } from "../../../utils/Date";

export function AssetStatusReadings({ asset }: { asset: any }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Status and Meter Readings</h2>
        <Button
          variant="ghost"
          className="gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 h-auto"
        >
          See More
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Status dropdown (visual only to preserve design) */}
        <div className="w-48">
          <div className="h-10 border rounded-md flex items-center px-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Online
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Last updated: <span className="font-medium">MaintainOS</span>,{" "}
          {formatFriendlyDate(asset?.updatedAt)}
        </p>

        {/* Meter reading card */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium">Electrical</span>
              <span className="text-muted-foreground">50 Feet</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-7 h-7">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                  <AvatarFallback>
                    {renderInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {user?.fullName}, on {formatFriendlyDate(asset.createdAt)}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {/* Work order history chart (exact same config) */}
      <div className="border-t border-border pt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium">Work Order History</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Aug 1 - Sep 19
            </span>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 p-0 grid place-items-center cursor-default">
                <div className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="h-8 w-8 p-0 grid place-items-center cursor-default">
                <div className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { date: "29/07/2025", value: 0 },
                { date: "04/08/2025", value: 0 },
                { date: "11/08/2025", value: 0 },
                { date: "18/08/2025", value: 0 },
                { date: "25/08/2025", value: 0 },
                { date: "01/09/2025", value: 0 },
                { date: "08/09/2025", value: 0 },
                { date: "15/09/2025", value: 3 },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="oklch(.646 .222 41.116)"
                strokeWidth={2}
                dot={{ fill: "oklch(.646 .222 41.116)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "oklch(.646 .222 41.116)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 rounded-full px-6"
          >
            <Calendar className="h-4 w-4" />
            Use in New Work Order
          </Button>
        </div>
      </div>
    </div>
  );
}
