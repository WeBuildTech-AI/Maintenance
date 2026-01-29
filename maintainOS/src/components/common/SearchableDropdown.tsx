import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

export interface SearchOption {
    id: string;
    label: string;
    avatar?: string; // Optional avatar URL
    subLabel?: string; // Optional secondary text (e.g. email)
}

interface SearchableDropdownProps {
    placeholder?: string;
    options: SearchOption[];
    onSelect: (option: SearchOption) => void;
    className?: string;
    // Optional async search callback if we want to fetch data on type
    onSearch?: (query: string) => void;
}

export function SearchableDropdown({
    placeholder = "Search...",
    options = [],
    onSelect,
    className = "",
    onSearch
}: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter options locally if no async search provided
    const filteredOptions = onSearch
        ? options
        : options.filter(opt =>
            opt.label.toLowerCase().includes(query.toLowerCase()) ||
            opt.subLabel?.toLowerCase().includes(query.toLowerCase())
        );

    // Handle Click Outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: SearchOption) => {
        onSelect(option);
        setQuery(option.label); // Optional: Set input to selection? Or keep empty? 
        // Usually for a search, we might want to clear or set it. 
        // Let's set it for now, user can clear it.
        setIsOpen(false);
    };

    const handleClear = () => {
        setQuery("");
        if (onSearch) onSearch("");
        setIsOpen(true); // Re-open to show all options
    };

    return (
        <div ref={wrapperRef} className={`relative w-full ${className}`}>
            {/* Input Field */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-[#B5850B]" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="h-9 w-full rounded-lg border border-transparent bg-gray-50 pl-9 pr-8 text-sm outline-none transition-all 
                               focus:bg-white focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] placeholder:text-gray-400"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        if (onSearch) onSearch(e.target.value);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="more-dropdown-content absolute top-[calc(100%+12px)] left-0 z-50 w-full animate-in fade-in zoom-in-95 duration-100 overflow-hidden !flex !flex-col !p-1.5 border border-gray-100 shadow-xl bg-white rounded-xl">
                    <ScrollArea className="max-h-[126px]">
                        {/* Strictly 3 items (~42px each) */}
                        <div className="flex flex-col">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleSelect(opt)}
                                        className="dropdown-nav-link flex items-center gap-3 w-full text-left rounded-md transition-all hover:bg-gray-50 border border-transparent hover:border-gray-100 !py-2.5"
                                    >
                                        <div className="h-7 w-7 rounded-full border border-yellow-400/30 flex items-center justify-center bg-gray-50 shrink-0 overflow-hidden">
                                            {opt.avatar ? (
                                                <img src={opt.avatar} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-800">{opt.label.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-gray-900 truncate leading-tight">{opt.label}</span>
                                            {opt.subLabel && (
                                                <span className="text-[10px] text-gray-500 truncate leading-tight">{opt.subLabel}</span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="py-6 text-center text-xs text-gray-400 font-medium">
                                    No results found
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
