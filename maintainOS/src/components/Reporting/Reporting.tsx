import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Calendar, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Dialog, DialogContent } from "../ui/dialog";
import { cn } from "../ui/utils";
import { WorkOrdersTab } from "./WorkOrders";
import { AssetHealthTab } from "./AssetHealth";
import ReportingFilterBar from "./ReportingFilterBar";
import { ReportingDetails } from "./ReportingDetails";
import { RecentActivity } from "./RecentActivity";

type TabType =
  | "work-orders"
  | "asset-health"
  | "reporting-details"
  | "recent-activity"
  | "export-data"
  | "custom-dashboards";

// Helper function to format date as MM/DD/YYYY
const formatDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Calculate default date range (last one month)
const getDefaultDateRange = () => {
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  return {
    startDate: formatDate(oneMonthAgo),
    endDate: formatDate(today),
    currentMonth: today.getMonth(),
    currentYear: today.getFullYear(),
  };
};

export function Reporting() {
  const defaultDates = getDefaultDateRange();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Helper function to validate tab type
  const isValidTab = (tab: string | null): tab is TabType => {
    const validTabs: TabType[] = [
      "work-orders",
      "asset-health",
      "reporting-details",
      "recent-activity",
      "export-data",
      "custom-dashboards",
    ];
    return tab !== null && validTabs.includes(tab as TabType);
  };

  // Initialize activeTab from URL or default to 'work-orders'
  const getInitialTab = (): TabType => {
    const tabParam = searchParams.get("tab");
    return isValidTab(tabParam) ? tabParam : "work-orders";
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);
  const [selectedMonth, setSelectedMonth] = useState(defaultDates.currentMonth);
  const [selectedYear, setSelectedYear] = useState(defaultDates.currentYear);
  const [filterParams, setFilterParams] = useState<Record<string, any>>({});
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [selectedDetailChart, setSelectedDetailChart] = useState<string | null>(
    null
  );
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);

  // Close date picker dialog when navigating away from reporting page
  useEffect(() => {
    if (!location.pathname.startsWith('/reporting')) {
      setShowDatePicker(false);
    }
  }, [location.pathname]);

  // Sync activeTab with URL
  // useEffect(() => {
  //   const tabParam = searchParams.get("tab");
  //   if (isValidTab(tabParam)) {
  //     setActiveTab(tabParam);
  //   }
  // }, [searchParams]);

  // Update URL when activeTab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Validate date format MM/DD/YYYY
  const isValidDateFormat = (dateStr: string): boolean => {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
    return regex.test(dateStr);
  };

  // Parse date string to Date object
  const parseDate = (dateStr: string): Date | null => {
    if (!isValidDateFormat(dateStr)) return null;
    const [month, day, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    // Check if date is valid (handles cases like 02/31/2025)
    if (date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    return date;
  };

  // Format input as user types (auto-add slashes)
  const formatDateInput = (value: string): string => {
    // Remove non-numeric characters except slashes
    const cleaned = value.replace(/[^0-9/]/g, '');
    const numbers = cleaned.replace(/\//g, '');

    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Handle start date input change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setTempStartDate(formatted);

    if (formatted.length === 10) {
      const date = parseDate(formatted);
      if (date) {
        setStartDateError(null);
        // Sync calendar to show this month
        setSelectedMonth(date.getMonth());
        setSelectedYear(date.getFullYear());
      } else {
        setStartDateError('Invalid date');
      }
    } else if (formatted.length > 0 && formatted.length < 10) {
      setStartDateError(null); // Clear error while typing
    } else {
      setStartDateError(null);
    }
  };

  // Handle end date input change
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setTempEndDate(formatted);

    if (formatted.length === 10) {
      const date = parseDate(formatted);
      if (date) {
        setEndDateError(null);
        // Validate end date is after start date
        const startDateParsed = parseDate(tempStartDate);
        if (startDateParsed && date < startDateParsed) {
          setEndDateError('End date must be after start date');
        }
      } else {
        setEndDateError('Invalid date');
      }
    } else if (formatted.length > 0 && formatted.length < 10) {
      setEndDateError(null); // Clear error while typing
    } else {
      setEndDateError(null);
    }
  };

  const tabs: { id: TabType; label: string; icon?: React.ReactNode }[] = [
    { id: "work-orders", label: "Work Orders" },
    {
      id: "asset-health",
      label: "Asset Health",
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

  const handleNavigateToDetails = useCallback((chartType: string) => {
    setSelectedDetailChart(chartType);
    handleTabChange("reporting-details");
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
    // Validate both dates before applying
    const startValid = parseDate(tempStartDate);
    const endValid = parseDate(tempEndDate);

    if (!startValid) {
      setStartDateError('Please enter a valid start date');
      return;
    }
    if (!endValid) {
      setEndDateError('Please enter a valid end date');
      return;
    }
    if (endValid < startValid) {
      setEndDateError('End date must be after start date');
      return;
    }

    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setStartDateError(null);
    setEndDateError(null);
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
    <div className="flex flex-col h-full bg-gray-50">
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

            {/* <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              This Week
              <ChevronDown className="h-4 w-4" />
            </Button> */}

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
              onClick={() => handleTabChange(tab.id)}
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
        style={{ position: "relative", overflow: "visible" }}
      >
        <ReportingFilterBar onParamsChange={handleFilterChange} activeTab={activeTab} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-6 py-6 relative z-0 mt-6">
        {activeTab === "work-orders" && (
          <WorkOrdersTab
            filters={filterParams}
            dateRange={{ startDate, endDate }}
            onNavigateToDetails={handleNavigateToDetails}
          />
        )}
        {activeTab === "asset-health" && (
          <AssetHealthTab
            filters={filterParams}
            dateRange={{ startDate, endDate }}
          />
        )}
        {activeTab === "reporting-details" && (
          <ReportingDetails
            filters={filterParams}
            dateRange={{ startDate, endDate }}
            initialChart={selectedDetailChart}
          />
        )}
        {activeTab === "recent-activity" && <RecentActivity />}
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
        <DialogContent className="max-w-md p-0 overflow-hidden" style={{ zIndex: 9999 }}>
          <div className="p-4">
            <div className="text-base font-semibold mb-3">Select Date Range</div>

            {/* Calendar */}
            <div className="p-0">
              {/* Date Inputs */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={tempStartDate}
                    onChange={handleStartDateChange}
                    maxLength={10}
                    className={`w-full px-2 py-1 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${startDateError ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="MM/DD/YYYY"
                  />
                  {startDateError && (
                    <p className="text-xs text-red-500 mt-1">{startDateError}</p>
                  )}
                </div>
                <span className="text-gray-400 text-sm">to</span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={tempEndDate}
                    onChange={handleEndDateChange}
                    maxLength={10}
                    className={`w-full px-2 py-1 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${endDateError ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="MM/DD/YYYY"
                  />
                  {endDateError && (
                    <p className="text-xs text-red-500 mt-1">{endDateError}</p>
                  )}
                </div>
              </div>
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

              {/* Timezone */}
              <div className="text-xs text-gray-500 text-center pt-2">
                Time zone: Asia/Kolkata
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
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
