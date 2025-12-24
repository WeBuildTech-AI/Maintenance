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
  parse,
  differenceInDays,
  subDays,
} from "date-fns";
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
  id: string;
  title?: string;
  filters: Record<string, any>;
  dateRange?: { startDate: string; endDate: string };
  onDateRangeChange?: (id: string, start: Date, end: Date) => void;
  showLegend?: boolean;
  workOrderHistory: { id: number | string; name: string };
}

export function WorkOrderHistoryChart({
  id,
  title = "Work Order History",
  filters = {},
  dateRange,
  onDateRangeChange,
  showLegend = true,
  workOrderHistory,
}: WorkOrderHistoryChartProps) {
  // --- State Initialization ---
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      return dateRange;
    }
    const end = new Date();
    const start = subDays(end, 6);
    return {
      startDate: format(start, "MM/dd/yyyy"),
      endDate: format(end, "MM/dd/yyyy"),
    };
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const settingsRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      setSelectedDateRange(dateRange);
    }
  }, [dateRange]);

  const handleApplyFilter = (start: Date, end: Date) => {
    const newRange = {
      startDate: format(start, "MM/dd/yyyy"),
      endDate: format(end, "MM/dd/yyyy"),
    };

    setSelectedDateRange(newRange);

    // [!code ++] Notify parent with ID
    if (onDateRangeChange) {
      onDateRangeChange(id, start, end);
    }

    setIsFilterOpen(false);
  };

  const apiFilters = useMemo(() => {
    const safeFilters = filters || {};
    return mapFilters(safeFilters, selectedDateRange);
  }, [filters, selectedDateRange]);

  const daysDiff = useMemo(() => {
    try {
      const start = parse(
        selectedDateRange.startDate,
        "MM/dd/yyyy",
        new Date()
      );
      const end = parse(selectedDateRange.endDate, "MM/dd/yyyy", new Date());
      return differenceInDays(end, start);
    } catch (e) {
      return 0;
    }
  }, [selectedDateRange]);

  // --- Queries ---
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

  const isLoading = createdLoading || completedLoading;

  // --- Process Data Logic ---
  const chartData = useMemo<ProcessedChartPoint[]>(() => {
    const createdMap = new Map<string, number>();
    const completedMap = new Map<string, number>();

    const normalizeDate = (dateStr: string): string | null => {
      try {
        const dateValue = !isNaN(Number(dateStr))
          ? new Date(Number(dateStr))
          : parseISO(dateStr);
        return isValid(dateValue) ? format(dateValue, "yyyy-MM-dd") : null;
      } catch {
        return null;
      }
    };

    const processItems = (items: ChartItem[], map: Map<string, number>) => {
      items.forEach((item) => {
        const rawLabel = item.groupValues?.[0];
        if (rawLabel && rawLabel !== "Unassigned") {
          const normalizedKey = normalizeDate(rawLabel);
          if (normalizedKey) {
            map.set(normalizedKey, (map.get(normalizedKey) || 0) + item.value);
          }
        }
      });
    };

    if (createdData?.getChartData)
      processItems(createdData.getChartData, createdMap);
    if (completedData?.getChartData)
      processItems(completedData.getChartData, completedMap);

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
      console.error("Date Parsing Error", e);
    }

    return allDays.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      const displayDate = format(day, "MMM dd");

      return {
        date: displayDate,
        rawDate: dateKey,
        created: createdMap.get(dateKey) || 0,
        completed: completedMap.get(dateKey) || 0,
      };
    });
  }, [createdData, completedData, selectedDateRange]);

  return (
    <>
      {workOrderHistory && (
        <Card className="rounded-lg">
          <CardHeader className="pb-2 flex flex-row justify-between items-center z-10 relative">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
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

          <CardContent className="relative min-h-[250px]">
            {isLoading && (
              // <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-md transition-all duration-300">
              //   <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              // </div>
              null
            )}

            <div className="text-xs text-muted-foreground mb-4 text-right">
              {isValid(
                parse(selectedDateRange.startDate, "MM/dd/yyyy", new Date())
              )
                ? format(
                    parse(
                      selectedDateRange.startDate,
                      "MM/dd/yyyy",
                      new Date()
                    ),
                    "dd MMM, yyyy"
                  )
                : selectedDateRange.startDate}
              {" - "}
              {isValid(
                parse(selectedDateRange.endDate, "MM/dd/yyyy", new Date())
              )
                ? format(
                    parse(selectedDateRange.endDate, "MM/dd/yyyy", new Date()),
                    "dd MMM, yyyy"
                  )
                : selectedDateRange.endDate}
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray=""
                  stroke="#e5e7eb"
                  vertical={true}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tickLine={false}
                  axisLine={false}
                  interval={daysDiff > 8 ? "preserveStartEnd" : 0}
                  minTickGap={10}
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
                {showLegend && <Legend verticalAlign="bottom" height={36} />}
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
