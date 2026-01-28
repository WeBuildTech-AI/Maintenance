import { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchFilterData } from "../../store/workOrders/workOrders.thunks";

// --- Types ---
export type FilterCategory =
    | "dueDate"
    | "location"
    | "asset"
    | "status"
    | "recurrence"
    | "workType"
    | "startDate"
    | "priority"
    | "assignee";

interface GlobalFilterDropdownProps {
    onClose: () => void;
    onApply: (filters: any) => void;
    className?: string;
    initialFilters?: Record<string, string[]>;
}

export function GlobalFilterDropdown({ onClose, onApply, initialFilters, className = "" }: GlobalFilterDropdownProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { filterData } = useSelector((state: RootState) => state.workOrders);

    // Fetch filter data (assets, locations, users, etc.) on mount
    useEffect(() => {
        dispatch(fetchFilterData());
    }, [dispatch]);

    const [activeCategory, setActiveCategory] = useState<FilterCategory>("asset");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>(initialFilters || {});

    // Sync state with parent filters if they change externally (optional, but good for consistency)
    useEffect(() => {
        if (initialFilters) {
            setSelectedItems(prev => ({ ...prev, ...initialFilters }));
        }
    }, [initialFilters]);

    // Categories definition
    const categories: { id: FilterCategory; label: string }[] = [
        { id: "asset", label: "Assets" },
        { id: "location", label: "Location" },
        { id: "status", label: "Status" },
        { id: "priority", label: "Priority" },
        { id: "dueDate", label: "Due Date" },
        { id: "startDate", label: "Start Date" },
        { id: "workType", label: "Work Type" },
        { id: "recurrence", label: "Recurrence" },
        { id: "assignee", label: "Assigned To" },
    ];

    // Toggle Selection Logic
    const toggleSelection = (category: string, id: string) => {
        const newSelectedItems = { ...selectedItems };
        const current = newSelectedItems[category] || [];
        const exists = current.includes(id);

        if (exists) {
            newSelectedItems[category] = current.filter(item => item !== id);
        } else {
            newSelectedItems[category] = [...current, id];
        }

        setSelectedItems(newSelectedItems);
        // Auto-apply on change to mimic instant feedback
        onApply(newSelectedItems);
    };

    // Get Options from Redux Data or Hardcoded Lists
    const currentOptions = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase();

        let options: { id: string; label: string }[] = [];

        switch (activeCategory) {
            case "asset":
                options = (filterData?.assets || []).map((a: any) => ({ id: a.id, label: a.name }));
                break;
            case "location":
                options = (filterData?.locations || []).map((l: any) => ({ id: l.id, label: l.name }));
                break;
            case "assignee":
                options = (filterData?.users || []).map((u: any) => ({
                    id: u.id,
                    label: u.name || `${u.firstName} ${u.lastName}`
                }));
                break;
            case "status":
                options = [
                    { id: "open", label: "Open" },
                    { id: "on_hold", label: "On Hold" },
                    { id: "in_progress", label: "In Progress" },
                    { id: "done", label: "Done" },
                    { id: "completed", label: "Completed" }
                ];
                break;
            case "priority":
                options = [
                    { id: "none", label: "None" },
                    { id: "low", label: "Low" },
                    { id: "medium", label: "Medium" },
                    { id: "high", label: "High" },
                    { id: "critical", label: "Critical" }
                ];
                break;
            case "workType":
                options = [
                    { id: "reactive", label: "Reactive" },
                    { id: "preventive", label: "Preventive" },
                    { id: "other", label: "Other" }
                ];
                break;
            case "recurrence":
                options = [
                    { id: "repeating", label: "Repeating" },
                    { id: "non_repeating", label: "Non-Repeating" }
                ];
                break;
            // Date fields are special, usually require a date picker. 
            // For now, providing basic presets matching WorkOrderFilterBar
            case "dueDate":
            case "startDate":
                options = [
                    { id: "today", label: "Today" },
                    { id: "tomorrow", label: "Tomorrow" },
                    { id: "thisWeek", label: "This Week" },
                    { id: "thisMonth", label: "This Month" },
                    { id: "overdue", label: "Overdue" },
                    { id: "custom", label: "Custom Date" } // Placeholder for actual date picker interaction
                ];
                break;
            default:
                options = [];
        }

        if (!searchQuery) return options;
        return options.filter(opt => opt.label.toLowerCase().includes(lowerQuery));
    }, [activeCategory, filterData, searchQuery]);

    return (
        <div
            className={`filter-dropdown-container ${className}`}
            data-testid="global-filter-dropdown"
            // Prevent clicks inside from closing the parent dropdown logic if implemented via click-outside
            onClick={(e) => e.stopPropagation()}
        >
            <div className="filter-dropdown-layout">
                {/* Sidebar */}
                <div className="filter-sidebar">
                    <ScrollArea className="h-full">
                        <div className="filter-sidebar-list">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        setSearchQuery(""); // Clear search when switching categories
                                    }}
                                    className={`filter-sidebar-btn ${activeCategory === cat.id ? "active" : ""}`}
                                    data-testid={`filter-category-${cat.id}`}
                                >
                                    {cat.label}
                                    {(selectedItems[cat.id]?.length || 0) > 0 && (
                                        <div className="filter-indicator-dot" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Content Area */}
                <div className="filter-content-area">
                    {/* Search & Operator Row */}
                    <div className="filter-search-row">
                        <div className="filter-search-wrapper">
                            <Search className="filter-search-icon" />
                            <input
                                placeholder={`Search ${categories.find(c => c.id === activeCategory)?.label}...`}
                                className="filter-search-input"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                data-testid="filter-search-input"
                            />
                        </div>

                        <button className="filter-operator-btn" data-testid="filter-operator-btn">
                            One of
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Options Grid */}
                    <ScrollArea className="filter-options-scroll">
                        <div className="filter-options-grid">
                            {currentOptions.length > 0 ? (
                                currentOptions.map((opt) => {
                                    const isChecked = (selectedItems[activeCategory] || []).includes(opt.id);
                                    return (
                                        <label
                                            key={opt.id}
                                            className="filter-option-item"
                                            data-testid={`filter-option-${opt.id}`}
                                        >
                                            <div
                                                onClick={() => toggleSelection(activeCategory, opt.id)}
                                                className={`filter-checkbox ${isChecked ? "checked" : ""}`}
                                            >
                                                {isChecked && <Check className="h-3 w-3" />}
                                            </div>
                                            <span className={`filter-option-label ${isChecked ? "checked" : ""}`}>
                                                {opt.label}
                                            </span>
                                        </label>
                                    );
                                })
                            ) : (
                                <div className="filter-no-results">
                                    No options found
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
