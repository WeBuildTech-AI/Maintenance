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

export function Reporting() {
  const [activeTab, setActiveTab] = useState<TabType>("work-orders");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("10/01/2025");
  const [endDate, setEndDate] = useState("12/05/2025");
  const [selectedMonth, setSelectedMonth] = useState(9); // October (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2025);
  const [filterParams, setFilterParams] = useState<Record<string, any>>({});
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

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

  const handleDateClick = (day: number, month: number, year: number) => {
    const dateStr = `${String(month + 1).padStart(2, "0")}/${String(
      day
    ).padStart(2, "0")}/${year}`;

    // Simple logic: first click sets start, second sets end
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(dateStr);
      setTempEndDate("");
    } else {
      setTempEndDate(dateStr);
    }
  };

  const handleApplyDates = () => {
    if (tempStartDate) setStartDate(tempStartDate);
    if (tempEndDate) setEndDate(tempEndDate);
    setShowDatePicker(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(selectedMonth - 1, selectedYear);
    for (let i = firstDay; i > 0; i--) {
      const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
      const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      const day = prevMonthDays - i + 1;
      days.push(
        <button
          key={`prev-${i}`}
          onClick={() => handleDateClick(day, prevMonth, prevYear)}
          className="p-1 text-xs text-gray-400 hover:bg-gray-50 rounded"
        >
          {day}
        </button>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = `${String(selectedMonth + 1).padStart(
        2,
        "0"
      )}/${String(day).padStart(2, "0")}/${selectedYear}`;
      const isStart = currentDate === tempStartDate;
      const isEnd = currentDate === tempEndDate;
      const isSelected = isStart || isEnd;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day, selectedMonth, selectedYear)}
          className={cn(
            "p-1 text-xs hover:bg-blue-50 rounded transition-colors font-medium",
            isSelected && "bg-blue-500 text-white hover:bg-blue-600",
            !isSelected && "text-gray-700"
          )}
        >
          {day}
        </button>
      );
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
      const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
      days.push(
        <button
          key={`next-${day}`}
          onClick={() => handleDateClick(day, nextMonth, nextYear)}
          className="p-1 text-xs text-gray-400 hover:bg-gray-50 rounded"
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
              onClick={() => {
                setTempStartDate(startDate);
                setTempEndDate(endDate);
                setShowDatePicker(true);
              }}
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
      <div
        className="border-b border-border bg-white px-6 py-3"
        style={{ position: "relative", zIndex: 999, overflow: "visible" }}
      >
        <ReportingFilterBar onParamsChange={handleFilterChange} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-6 py-6 relative z-0 mt-6">
        {activeTab === "work-orders" && (
          <WorkOrdersTab
            filters={filterParams}
            dateRange={{ startDate, endDate }}
          />
        )}
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
        <DialogContent className="max-w-md p-4" style={{ zIndex: 9999 }}>
          <DialogHeader>
            <DialogTitle className="text-base">Select Date Range</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* Date Inputs */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempStartDate}
                readOnly
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                placeholder="Start date"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="text"
                value={tempEndDate}
                readOnly
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                placeholder="End date"
              />
            </div>

            {/* Calendar */}
            <div className="border rounded-lg p-3">
              {/* Month/Year Selector */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11);
                      setSelectedYear(selectedYear - 1);
                    } else {
                      setSelectedMonth(selectedMonth - 1);
                    }
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-sm font-bold"
                >
                  ←
                </button>
                <span className="text-sm font-medium">
                  {monthNames[selectedMonth]} {selectedYear}
                </span>
                <button
                  onClick={() => {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0);
                      setSelectedYear(selectedYear + 1);
                    } else {
                      setSelectedMonth(selectedMonth + 1);
                    }
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-sm font-bold"
                >
                  →
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-xs font-medium text-gray-500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
            </div>

            {/* Timezone */}
            <div className="text-xs text-gray-500 text-center pt-2">
              Time zone: Asia/Kolkata
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setTempStartDate(startDate);
                  setTempEndDate(endDate);
                  setShowDatePicker(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyDates}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
