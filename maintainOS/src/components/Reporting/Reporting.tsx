import { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Calendar, ChevronDown, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "../ui/utils";
import { WorkOrdersTab } from "./WorkOrders";
import ReportingFilterBar from "./ReportingFilterBar";

type TabType =
  | "work-orders"
  | "asset-health"
  | "reporting-details"
  | "recent-activity"
  | "export-data"
  | "custom-dashboards";

type DateRangeType = "between" | "last";

export function Reporting() {
  const [activeTab, setActiveTab] = useState<TabType>("work-orders");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("between");
  const [startDate, setStartDate] = useState("10/01/2025");
  const [endDate, setEndDate] = useState("12/05/2025");
  const [selectedMonth, setSelectedMonth] = useState(9); // October (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2025);
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("week");
  const [filterParams, setFilterParams] = useState<Record<string, any>>({});

  const tabs: { id: TabType; label: string; icon?: React.ReactNode }[] = [
    { id: "work-orders", label: "Work Orders" },
    {
      id: "asset-health",
      label: "Asset Health",
      icon: <Lock className="h-3 w-3 ml-1" />,
    },
    { id: "reporting-details", label: "Reporting Details" },
    { id: "recent-activity", label: "Recent Activity" },
    { id: "export-data", label: "Export Data" },
    { id: "custom-dashboards", label: "Custom Dashboards" },
  ];

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}`);
  };

  const handleFilterChange = useCallback((params: Record<string, any>) => {
  setFilterParams(params);
  console.log("Filter params:", params);
}, []); 

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(selectedMonth - 1, selectedYear);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <button
          key={`prev-${i}`}
          className="p-2 text-gray-400 hover:bg-gray-50 rounded-md"
        >
          {prevMonthDays - i}
        </button>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === 1 && selectedMonth === 9; // Example: Oct 1
      days.push(
        <button
          key={day}
          className={cn(
            "p-2 hover:bg-blue-50 rounded-md transition-colors",
            isToday && "bg-blue-500 text-white hover:bg-blue-600"
          )}
        >
          {day}
        </button>
      );
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <button
          key={`next-${day}`}
          className="p-2 text-gray-400 hover:bg-gray-50 rounded-md"
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-border bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Reporting</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDatePicker(true)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4 text-blue-500" />
              {startDate} - {endDate}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              This Week
              <ChevronDown className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Export
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-white">
        <div className="flex gap-6 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              )}
            >
              {tab.label}
              {tab.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-white px-6 py-3" style={{ position: 'relative', zIndex: 999, overflow: 'visible' }}>
        <ReportingFilterBar onParamsChange={handleFilterChange} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-6 py-6 relative z-0">
        {activeTab === "work-orders" && <WorkOrdersTab />}
        {activeTab === "asset-health" && (
          <div className="text-center py-12 text-gray-500">
            Asset Health tab is locked. Upgrade to access this feature.
          </div>
        )}
        {activeTab === "reporting-details" && (
          <div className="text-center py-12 text-gray-500">
            Reporting Details content coming soon.
          </div>
        )}
        {activeTab === "recent-activity" && (
          <div className="text-center py-12 text-gray-500">
            Recent Activity content coming soon.
          </div>
        )}
        {activeTab === "export-data" && (
          <div className="text-center py-12 text-gray-500">
            Export Data content coming soon.
          </div>
        )}
        {activeTab === "custom-dashboards" && (
          <div className="text-center py-12 text-gray-500">
            Custom Dashboards content coming soon.
          </div>
        )}
      </div>

      {/* Date Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Date Range Type Selector */}
            <div className="flex gap-2">
              <Button
                variant={dateRangeType === "between" ? "default" : "outline"}
                onClick={() => setDateRangeType("between")}
                className={cn(
                  dateRangeType === "between" &&
                    "bg-blue-500 hover:bg-blue-600 text-white"
                )}
              >
                Between
              </Button>
              <Button
                variant={dateRangeType === "last" ? "default" : "outline"}
                onClick={() => setDateRangeType("last")}
              >
                Last
              </Button>
            </div>

            {/* Date Inputs */}
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Start date"
              />
              <span>-</span>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="End date"
              />
            </div>

            {/* Calendar */}
            <div className="border rounded-lg p-4">
              {/* Month/Year Selector */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11);
                      setSelectedYear(selectedYear - 1);
                    } else {
                      setSelectedMonth(selectedMonth - 1);
                    }
                  }}
                >
                  «
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedMonth === 0) {
                      setSelectedMonth(0);
                      setSelectedYear(selectedYear - 1);
                    } else {
                      setSelectedMonth(0);
                    }
                  }}
                >
                  ‹
                </Button>
                <span className="text-sm font-medium text-blue-600">
                  {monthNames[selectedMonth]} {selectedYear}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedMonth === 11) {
                      setSelectedMonth(11);
                      setSelectedYear(selectedYear + 1);
                    } else {
                      setSelectedMonth(11);
                    }
                  }}
                >
                  ›
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0);
                      setSelectedYear(selectedYear + 1);
                    } else {
                      setSelectedMonth(selectedMonth + 1);
                    }
                  }}
                >
                  »
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-sm font-medium text-gray-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
            </div>

            {/* Group By Options */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Group by</h3>
              <div className="flex gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="groupBy"
                    value="day"
                    checked={groupBy === "day"}
                    onChange={() => setGroupBy("day")}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Day</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="groupBy"
                    value="week"
                    checked={groupBy === "week"}
                    onChange={() => setGroupBy("week")}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Week</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="groupBy"
                    value="month"
                    checked={groupBy === "month"}
                    onChange={() => setGroupBy("month")}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Month</span>
                </label>
              </div>
            </div>

            {/* Timezone */}
            <div className="text-sm text-gray-600">
              Time zone for all dates: Asia/Kolkata
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
