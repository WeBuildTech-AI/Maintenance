import type { Dispatch, SetStateAction } from "react";
import type { ViewMode } from "./types";
import { Button } from "../ui/button";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Settings,
} from "lucide-react";
import { Input } from "../ui/input";
import WorkOrderFilterBar from "./WorkOrderFilterBar";
import { format } from "date-fns";
import { GlobalFilterDropdown } from "../common/GlobalFilterDropdown";
import { useState } from "react";
import type { FetchWorkOrdersParams } from "../../store/workOrders/workOrders.types";

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
    // ✅ New Props for Calendar Navigation
    currentDate?: Date;
    onPrevDate?: () => void;
    onNextDate?: () => void;
    onViewModeChange?: (mode: ViewMode) => void;
}

export function UnifiedHeader({
    viewMode,
    searchQuery,
    setSearchQuery,
    setIsCreatingForm,
    setIsModalOpen,
    setIsSettingsModalOpen,
    onFilterChange,
    setShowSettings,
    currentDate = new Date(),
    onPrevDate,
    onNextDate,
    onViewModeChange
}: WorkOrderHeaderProps) {
    const isCalendar = viewMode === "calendar" || viewMode === "calendar-week"; // Assuming we might distinguish modes or handled by parent
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Format Date Title
    const title = (viewMode === 'calendar')
        ? format(currentDate, "MMMM yyyy")
        : (viewMode === 'workload') ? 'Workload' : "Work Orders";

    const handleFilterApply = (filters: Record<string, string[]>) => {
        // Prepare params for API
        const params: FetchWorkOrdersParams = {};

        Object.entries(filters).forEach(([key, values]) => {
            if (values.length > 0) {
                // Pass as array, let the API client stringify if needed (e.g. qs)
                // or assume backend handles arrays (common in this app)
                params[key] = values;
            } else {
                // Clear filter if empty
                params[key] = undefined;
            }
        });

        // Trigger the parent filter change handler
        onFilterChange?.(params);
    };

    return (
        <header className="header-section">
            <div className="header-row">
                {/* Left Side: Title & Date Navigation */}
                <div className="header-title-group flex items-center">
                    <h1 className="header-title min-w-[200px]" data-testid="header-title">{title}</h1>

                    {/* Date Navigation (Calendar Only) - Single Container Style */}
                    {viewMode === 'calendar' && (
                        <div className="header-date-nav">
                            <button className="header-nav-arrow" data-testid="nav-prev-btn" onClick={onPrevDate}>
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="header-nav-text" data-testid="nav-current-btn">
                                This Month
                            </span>
                            <button className="header-nav-arrow" data-testid="nav-next-btn" onClick={onNextDate}>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Side: Search, Filter, Actions */}
                <div className="header-actions-group">
                    {/* Search Bar */}
                    <div className="header-search-container relative">
                        <Search className="header-search-icon" />
                        <Input
                            placeholder={isCalendar ? "Search Workorder" : "Search work orders"}
                            className={`header-search-input ${!isCalendar ? "list-variant" : ""}`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            data-testid="header-search-input"
                        />
                    </div>

                    {/* Filter Button (Calendar Only) */}
                    {isCalendar && (
                        <div className="relative">
                            <Button
                                variant="outline"
                                className={`header-filter-btn ${showFilterDropdown ? "border-[#FFC107] ring-1 ring-[#FFC107] bg-orange-50" : ""}`}
                                data-testid="calendar-filter-btn"
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            >
                                Filter
                                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilterDropdown ? "rotate-180" : "opacity-50"}`} />
                            </Button>

                            {/* Dropdown */}
                            {showFilterDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowFilterDropdown(false)}
                                    />
                                    <GlobalFilterDropdown
                                        onClose={() => setShowFilterDropdown(false)}
                                        onApply={handleFilterApply}
                                    />
                                </>
                            )}
                        </div>
                    )}

                    {/* Settings Button (List View Only? Or Both?) */}
                    {!isCalendar && (
                        <button
                            onClick={() => setIsSettingsModalOpen?.(true)}
                            className="header-nav-btn ml-2"
                            data-testid="settings-btn"
                        >
                            <Settings className="h-5 w-5 text-gray-500 hover:text-orange-600 transition-all" />
                        </button>
                    )}
                </div>
            </div>

            {/* Row 2: List View specific Filter Bar */}
            {!isCalendar && (
                <div className="header-row mt-2">
                    <div className="flex items-center gap-2 w-full">
                        <WorkOrderFilterBar onParamsChange={onFilterChange} />
                    </div>
                </div>
            )}
        </header>
    );
}
