import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { CreatedVsCompletedDetail } from "./CreatedVsCompletedDetail";
import { NonRepeatingVsRepeatingDetail } from "./NonRepeatingVsRepeatingDetail";
import { StatusDetail } from "./StatusDetail";
import { PriorityDetail } from "./PriorityDetail";
import { WorkOrdersByTypeDetail } from "./WorkOrdersByTypeDetail";
import { TimeVsCostDetail } from "./TimeVsCostDetail";
import { TimeToCompleteDetail } from "./TimeToCompleteDetail";

interface ReportingDetailsProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
  initialChart?: string | null;
}

type ChartType =
  | "created-vs-completed"
  | "non-repeating-vs-repeating"
  | "status"
  | "priority"
  | "work-orders-by-type"
  | "time-vs-cost"
  | "time-to-complete";

const chartOptions = [
  { id: "created-vs-completed" as ChartType, label: "Created vs. Completed" },
  {
    id: "non-repeating-vs-repeating" as ChartType,
    label: "Non-Repeating vs. Repeating",
  },
  { id: "status" as ChartType, label: "Status" },
  { id: "priority" as ChartType, label: "Priority" },
  { id: "work-orders-by-type" as ChartType, label: "Work Orders by Type" },
  { id: "time-vs-cost" as ChartType, label: "Time vs. Cost Reports" },
  { id: "time-to-complete" as ChartType, label: "Time to Complete" },
];

export function ReportingDetails({
  filters,
  dateRange,
  initialChart,
}: ReportingDetailsProps) {
  const [selectedChart, setSelectedChart] = useState<ChartType>(
    (initialChart as ChartType) || "created-vs-completed"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedChartLabel =
    chartOptions.find((opt) => opt.id === selectedChart)?.label ||
    "Created vs. Completed";

  const filteredOptions = chartOptions.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Chart Selector Dropdown */}
      <div className="flex justify-end items-center gap-4">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-lg font-medium hover:bg-gray-50"
            >
              <Search className="h-5 w-5 text-gray-400" />
              {selectedChartLabel}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[400px] p-2">
            {/* Search Input */}
            <div className="px-2 pb-2">
              <Input
                placeholder="Search charts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Chart Options */}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => {
                    setSelectedChart(option.id);
                    setSearchQuery("");
                    setIsDropdownOpen(false);
                  }}
                  className={`cursor-pointer px-3 py-2 ${
                    selectedChart === option.id
                      ? "bg-blue-50 text-blue-600"
                      : ""
                  }`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No charts found
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chart Detail Component */}
      <div className="mt-6">
        {selectedChart === "created-vs-completed" && (
          <CreatedVsCompletedDetail filters={filters} dateRange={dateRange} />
        )}
        {selectedChart === "non-repeating-vs-repeating" && (
          <NonRepeatingVsRepeatingDetail
            filters={filters}
            dateRange={dateRange}
          />
        )}
        {selectedChart === "status" && (
          <StatusDetail filters={filters} dateRange={dateRange} />
        )}
        {selectedChart === "priority" && (
          <PriorityDetail filters={filters} dateRange={dateRange} />
        )}
        {selectedChart === "work-orders-by-type" && (
          <WorkOrdersByTypeDetail filters={filters} dateRange={dateRange} />
        )}
        {selectedChart === "time-vs-cost" && (
          <TimeVsCostDetail filters={filters} dateRange={dateRange} />
        )}
        {selectedChart === "time-to-complete" && (
          <TimeToCompleteDetail filters={filters} dateRange={dateRange} />
        )}
      </div>
    </div>
  );
}
