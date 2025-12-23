import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHART_DATA } from "../../graphql/reporting.queries";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import { Loader2, Settings } from "lucide-react";
import {
  format,
  parseISO,
  isValid,
  eachDayOfInterval,
  startOfDay,
  parse,
} from "date-fns"; //  Imported extra date utilities
import { mapFilters } from "../Reporting/filterUtils";
import { CustomDateRangeModal } from "./CustomDateRangeModal";

// --- Type Definitions ---
interface ChartItem {
  groupValues: string[];
  value: number;
}

interface ChartResponse {
  getChartData: ChartItem[];
}

interface ProcessedChartPoint {
  date: string;
  rawDate: string;
  created: number;
  completed: number;
}

interface WorkOrderHistoryChartProps {
  title?: string;
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
  showLegend?: boolean;
  workOrderHistory: { id: number | string; name: string };
}

export function WorkOrderHistoryChart({
  title = "Work Order History",
  filters,
  dateRange,
  showLegend = true,
  workOrderHistory,
}: WorkOrderHistoryChartProps) {
  const [selectedDateRange, setSelectedDateRange] = useState(dateRange);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const settingsRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelectedDateRange(dateRange);
  }, [dateRange]);

  const handleApplyFilter = (start: Date, end: Date) => {
    setSelectedDateRange({
      startDate: format(start, "MM/dd/yyyy"),
      endDate: format(end, "MM/dd/yyyy"),
    });
    setIsFilterOpen(false);
  };

  const apiFilters = useMemo(() => {
    return mapFilters(filters, selectedDateRange);
  }, [filters, selectedDateRange]);

  // Fetch Created Data
  const { data: createdData, loading: createdLoading } =
    useQuery<ChartResponse>(GET_CHART_DATA, {
      variables: {
        input: {
          dataset: "WORK_ORDERS",
          groupByFields: ["createdAt"],
          metric: "COUNT",
          filters: apiFilters,
        },
      },
      fetchPolicy: "cache-and-network",
    });

  // Fetch Completed Data
  const { data: completedData, loading: completedLoading } =
    useQuery<ChartResponse>(GET_CHART_DATA, {
      variables: {
        input: {
          dataset: "WORK_ORDERS",
          groupByFields: ["completedAt"],
          metric: "COUNT",
          filters: apiFilters,
        },
      },
      fetchPolicy: "cache-and-network",
    });

  // LOGIC UPDATE: Fill in missing dates
  const chartData = useMemo<ProcessedChartPoint[]>(() => {
    const createdMap = new Map<string, number>();
    const completedMap = new Map<string, number>();

    // 1. Helper to normalize backend dates to "YYYY-MM-DD"
    const normalizeDate = (dateStr: string): string | null => {
      try {
        const dateValue = !isNaN(Number(dateStr))
          ? new Date(Number(dateStr))
          : parseISO(dateStr);
        if (isValid(dateValue)) {
          return format(dateValue, "yyyy-MM-dd");
        }
      } catch (e) {
        return null;
      }
      return null;
    };

    // 2. Populate Maps from API Data
    const processItems = (items: ChartItem[], map: Map<string, number>) => {
      items.forEach((item) => {
        const rawLabel = item.groupValues?.[0];
        if (rawLabel && rawLabel !== "Unassigned") {
          const normalizedKey = normalizeDate(rawLabel);
          if (normalizedKey) {
            // Aggregate values if multiple entries exist for same day
            const existing = map.get(normalizedKey) || 0;
            map.set(normalizedKey, existing + item.value);
          }
        }
      });
    };

    if (createdData?.getChartData)
      processItems(createdData.getChartData, createdMap);
    if (completedData?.getChartData)
      processItems(completedData.getChartData, completedMap);

    // 3. Generate FULL Date Range (Continuity Logic)
    let allDays: Date[] = [];
    try {
      const start = parse(
        selectedDateRange.startDate,
        "MM/dd/yyyy",
        new Date()
      );
      const end = parse(selectedDateRange.endDate, "MM/dd/yyyy", new Date());

      if (isValid(start) && isValid(end)) {
        allDays = eachDayOfInterval({ start, end });
      }
    } catch (e) {
      console.error("Error generating date interval", e);
    }

    // 4. Map Full Range to Data (Default to 0 if missing)
    return allDays.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd"); // Key for Lookup
      const displayDate = format(day, "MMM dd"); // Label for Chart

      return {
        date: displayDate,
        rawDate: dateKey,
        created: createdMap.get(dateKey) || 0, // Shows 0 if no data
        completed: completedMap.get(dateKey) || 0, //  Shows 0 if no data
      };
    });
  }, [createdData, completedData, selectedDateRange]);

  if (createdLoading || completedLoading) {
    return (
      <Card className="h-[300px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </Card>
    );
  }

  return (
    <>
      {workOrderHistory && (
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between items-center z-10 relative">
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            <div className="relative">
              <button
                ref={settingsRef}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
              {isFilterOpen && (
                <CustomDateRangeModal
                  anchorRef={settingsRef}
                  onClose={() => setIsFilterOpen(false)}
                  onApply={handleApplyFilter}
                  position="auto"
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-4 text-right">
              {selectedDateRange.startDate} - {selectedDateRange.endDate}
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd" // Ensures first and last date always show
                  minTickGap={20} // Prevents bunching up of dates
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                {showLegend && <Legend verticalAlign="top" height={36} />}
                <Line
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#3b82f6" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </>
  );
}
