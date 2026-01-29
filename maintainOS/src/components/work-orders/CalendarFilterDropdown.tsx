import { useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

// --- Types ---
type FilterCategory =
    | "dueDate"
    | "location"
    | "assets"
    | "status"
    | "recurrence"
    | "workType"
    | "startDate";

interface FilterOption {
    id: string;
    label: string;
    checked: boolean;
}

interface CalendarFilterDropdownProps {
    onClose: () => void;
    onApply: (filters: any) => void;
    // We can pass data props here (assets list, etc.)
    assets?: { id: string; name: string }[];
    locations?: { id: string; name: string }[];
}

export function CalendarFilterDropdown({ onClose, onApply, assets = [], locations = [] }: CalendarFilterDropdownProps) {
    const [activeCategory, setActiveCategory] = useState<FilterCategory>("assets");
    const [searchQuery, setSearchQuery] = useState("");

    // -- Mock Data for Categories that aren't dynamic yet --
    const categories: { id: FilterCategory; label: string }[] = [
        { id: "dueDate", label: "Due Date" },
        { id: "location", label: "Location" },
        { id: "assets", label: "Assets" },
        { id: "status", label: "Status" },
        { id: "recurrence", label: "Recurrence" },
        { id: "workType", label: "Work Type" },
        { id: "startDate", label: "Start Date" },
    ];

    // -- State for Selections --
    // For now, simple state map. Ideally this syncs with URL params or Redux.
    const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({
        assets: ["copy-cnc-02"], // Mock initial selection based on screenshot
        status: ["in_progress"],
        workType: [],
        location: [],
    });

    const toggleSelection = (category: string, id: string) => {
        setSelectedItems(prev => {
            const current = prev[category] || [];
            const exists = current.includes(id);
            if (exists) {
                return { ...prev, [category]: current.filter(item => item !== id) };
            } else {
                return { ...prev, [category]: [...current, id] };
            }
        });
    };

    // -- Content Rendering Logic --
    // This would ideally come from props/redux
    const getCategoryOptions = (category: FilterCategory) => {
        switch (category) {
            case "assets":
                return assets.length > 0 ? assets.map(a => ({ id: a.id, label: a.name })) : [
                    // Mock Fallback if no assets passed
                    { id: "copy-cnc-02", label: "Copy - CNC Machine - 02" },
                    { id: "steam-boiler", label: "Steam Boiler 500 PSI - SB-008" },
                    { id: "test-assets", label: "Test assets" },
                    { id: "mig-welding", label: "MIG Welding Station - MWS-006" },
                    { id: "air-compressor-1", label: "Air Compressor 100HP - AC-009" },
                    { id: "chiller-unit", label: "Chiller Unit 50 Ton - CH-0104" },
                    { id: "forklift", label: "Electric Forklift 3 Ton - FL-007" },
                    { id: "diesel-gen", label: "Diesel Generator 500 KVA - DG-009" },
                    { id: "hvac-unit", label: "HVAC Air Handler Unit - AHU-011" },
                ];
            case "status":
                return [
                    { id: "open", label: "Open" },
                    { id: "on_hold", label: "On Hold" },
                    { id: "in_progress", label: "In Progress" },
                    { id: "done", label: "Done" },
                ];
            case "workType":
                return [
                    { id: "reactive", label: "Reactive" },
                    { id: "preventive", label: "Preventive" }
                ];
            default:
                return [];
        }
    };

    const currentOptions = getCategoryOptions(activeCategory);
    const filteredOptions = currentOptions.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="calendar-filter-dropdown-menu absolute top-[110%] left-0 flex w-[480px] h-[340px] flex-col rounded-[10px] border border-gray-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-[160px] flex-none border-r border-gray-100 bg-white py-4">
                    <div className="flex flex-col gap-1 px-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors 
                                ${activeCategory === cat.id
                                        ? "bg-[#FFF9E6] text-[#B5850B]"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                {cat.label}
                                {/* Show dot if filters active in this category */}
                                {(selectedItems[cat.id]?.length || 0) > 0 && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#B5850B]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col p-5 bg-white">
                    {/* Search & Operator Row */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                placeholder={`Search ${categories.find(c => c.id === activeCategory)?.label}...`}
                                className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 text-sm outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] placeholder:text-gray-300"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* "One of" Dropdown Filter operator - Visual only for now */}
                        <button className="flex h-9 items-center gap-2 rounded-md border border-orange-200 bg-white px-3 text-sm font-medium text-orange-500 hover:bg-orange-50">
                            One of
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Options Grid */}
                    <ScrollArea className="flex-1 -mr-3 pr-3">
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => {
                                    const isChecked = (selectedItems[activeCategory] || []).includes(opt.id);
                                    return (
                                        <label key={opt.id} className="flex cursor-pointer items-start gap-2.5 group">
                                            <div
                                                onClick={() => toggleSelection(activeCategory, opt.id)}
                                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-all
                                                ${isChecked
                                                        ? "border-[#FFC107] bg-[#FFC107] text-white"
                                                        : "border-orange-200 bg-white group-hover:border-orange-300"
                                                    }`}
                                            >
                                                {isChecked && <Check className="h-3 w-3" />}
                                            </div>
                                            <span className={`text-[13px] leading-tight ${isChecked ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                                {opt.label}
                                            </span>
                                        </label>
                                    );
                                })
                            ) : (
                                <div className="col-span-2 py-8 text-center text-sm text-gray-400">
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
