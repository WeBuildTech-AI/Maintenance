import type { Dispatch, SetStateAction } from "react";
import type { ViewMode } from "./types";
import { Button } from "../ui/button";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
} from "lucide-react";
import { Input } from "../ui/input";
import WorkOrderFilterBar from "./WorkOrderFilterBar";
import type { FetchWorkOrdersParams } from "../../store/workOrders/workOrders.types";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface WorkOrderHeaderProps {
  viewMode: ViewMode;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setIsCreatingForm: Dispatch<SetStateAction<boolean>>;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  setIsModalOpen?: Dispatch<SetStateAction<boolean>>;
  setIsSettingsModalOpen?: Dispatch<SetStateAction<boolean>>;
  setShowDeleted?: Dispatch<SetStateAction<boolean>>;
  onFilterChange?: (params: FetchWorkOrdersParams) => void;
}

export function WorkOrderHeaderComponent({
  viewMode,
  searchQuery,
  setSearchQuery,
  onFilterChange,
  setIsSettingsModalOpen,
}: WorkOrderHeaderProps) {
  const navigate = useNavigate();
  const isCalendar = viewMode === "calendar";

  // Mock date for Calendar view design (Jan 2026 as per screenshot)
  const currentDate = new Date(2026, 0, 1);
  const title = isCalendar ? format(currentDate, "MMM yyyy") : "Work Orders";

  return (
    <header className="header-section">
      <div className="header-row">
        {/* Left Side: Title & Optional Filter Dropdown */}
        <div className="header-title-group">
          <h1 className="header-title">{title}</h1>
          {isCalendar && (
            <Button variant="outline" className="header-filter-btn">
              Filter
              <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
            </Button>
          )}
        </div>

        {/* Right Side: Search & Actions */}
        <div className="header-actions-group">
          {/* Search Bar */}
          <div className={`header-search-container ${!isCalendar ? "list-variant" : ""}`}>
            <Search className={`header-search-icon ${!isCalendar ? "list-variant" : ""}`} />
            <Input
              placeholder={isCalendar ? "Search Workorder" : "Search work orders"}
              className={`header-search-input ${!isCalendar ? "list-variant" : ""}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Conditional Actions */}
          {isCalendar ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" className="header-nav-btn">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="outline" className="header-nav-btn-text">
                This Week
              </Button>
              <Button variant="outline" className="header-nav-btn">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button
              className="header-primary-btn"
              onClick={() => navigate("/work-orders/create")}
            >
              <Plus className="h-4 w-4" />
              New Work Order
            </Button>
          )}
        </div>
      </div>

      {/* Row 2: List View specific Filter Bar */}
      {!isCalendar && (
        <div className="header-row mt-2">
          <div className="flex items-center gap-2 w-full">
            <WorkOrderFilterBar onParamsChange={onFilterChange} />
          </div>
          {/* Settings button for list view could go here if needed, consistent with previous design */}
          <button
            onClick={() => setIsSettingsModalOpen?.(true)}
            className="header-nav-btn ml-2"
          >
            <Settings className="h-5 w-5 text-gray-500 hover:text-orange-600 transition-all" />
          </button>
        </div>
      )}
    </header>
  );
}
