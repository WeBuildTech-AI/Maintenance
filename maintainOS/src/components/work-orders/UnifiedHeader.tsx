import type { Dispatch, SetStateAction } from "react";
import type { ViewMode } from "./types";
import { Button } from "../ui/button";
import {
    LayoutGrid,
    List,
    Calendar as CalendarIcon,
    Search,
    ChevronDown,
    Settings,
} from "lucide-react";
import { Input } from "../ui/input";
import WorkOrderFilterBar from "./WorkOrderFilterBar";
import { format } from "date-fns";
import { GlobalFilterDropdown } from "../common/GlobalFilterDropdown";
import { useState } from "react";
import type { FetchWorkOrdersParams } from "../../store/workOrders/workOrders.types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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
    pageTitle?: string;
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
    onViewModeChange,
    pageTitle
}: WorkOrderHeaderProps) {
    const isCalendar = viewMode === "calendar" || viewMode === "calendar-week"; // Assuming we might distinguish modes or handled by parent
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Format Date Title
    // Format Date Title
    const title = pageTitle || ((viewMode === 'calendar' || viewMode === 'calendar-week')
        ? format(currentDate, "MMMM yyyy")
        : (viewMode === 'workload') ? 'Workload' : "Work Orders");

    const getViewLabel = () => {
        if (viewMode === 'todo') return 'Panel View';
        if (viewMode === 'list') return 'List View';
        if (viewMode === 'calendar' || viewMode === 'calendar-week') return 'Calendar View';
        if (viewMode === 'workload') return 'Workload View';
        return 'View';
    };

    const handleFilterApply = (filters: Record<string, string[]>) => {
        // Prepare params for API
        const params: Record<string, any> = {};

        Object.entries(filters).forEach(([key, values]) => {
            if (values.length > 0) {
                // Map assignedTo to assignee if it comes from GlobalFilterDropdown
                const apiKey = key === "assignedTo" ? "assignee" : key;

                // For standard filters, append OneOf as requested
                if (["asset", "location", "status", "priority", "assignee", "workType", "category", "part", "vendor"].includes(apiKey)) {
                    params[`${apiKey}OneOf`] = values.join(",");
                } else if (["dueDate", "startDate"].includes(apiKey)) {
                    params[`${apiKey}Preset`] = values[0];
                } else {
                    params[apiKey] = values.join(",");
                }
            } else {
                // Clear filter if empty
                // We need to clear all possible variants
                const apiKey = key === "assignedTo" ? "assignee" : key;
                params[`${apiKey}OneOf`] = null;
                params[`${apiKey}Preset`] = null;
                params[apiKey] = null;
            }
        });

        // Trigger the parent filter change handler
        onFilterChange?.(params);
    };

    return (
        <header className="header-section">
            <div className="header-row">
                {/* Left Side: Title & Date Navigation */}
                <div className="header-title-group flex items-center gap-4">
                    <h1 className="header-title min-w-[120px]" data-testid="header-title">{title}</h1>

                    {/* View Switcher Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="more-dropdown-btn h-9" data-testid="view-switcher-trigger">
                                {viewMode === 'todo' && <LayoutGrid className="mr-1 h-4 w-4" />}
                                {viewMode === 'list' && <List className="mr-1 h-4 w-4" />}
                                {(viewMode === 'calendar' || viewMode === 'calendar-week') && <CalendarIcon className="mr-1 h-4 w-4" />}
                                {getViewLabel()}
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="more-dropdown-content" style={{ width: "180px" }}>
                            <DropdownMenuItem
                                onClick={() => onViewModeChange?.('todo')}
                                className={`dropdown-nav-link ${viewMode === 'todo' ? 'active' : ''}`}
                            >
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                <span>Panel View</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onViewModeChange?.('calendar-week')}
                                className={`dropdown-nav-link ${viewMode === 'calendar-week' || viewMode === 'calendar' ? 'active' : ''}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span>Calendar View</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onViewModeChange?.('list')}
                                className={`dropdown-nav-link ${viewMode === 'list' ? 'active' : ''}`}
                            >
                                <List className="mr-2 h-4 w-4" />
                                <span>List View</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
