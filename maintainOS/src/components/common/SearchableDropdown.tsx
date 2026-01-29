import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

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
        setQuery("");
        setIsOpen(false);
    };

    const handleClear = () => {
        setQuery("");
        if (onSearch) onSearch("");
        setIsOpen(true); // Re-open to show all options
    };

    return (
        <div ref={wrapperRef} className={`search-dropdown-container ${className}`}>
            {/* Input Field */}
            <div className="search-dropdown-input-wrapper">
                <Search className="search-dropdown-icon" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="search-dropdown-input"
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
                        className="search-dropdown-clear-btn"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="search-dropdown-results">
                    <div className="search-dropdown-scroll-area custom-app-scrollbar">
                        <div className="search-dropdown-options-list">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleSelect(opt)}
                                        className="search-dropdown-option-btn"
                                    >
                                        <div className="search-dropdown-avatar-wrapper">
                                            {opt.avatar ? (
                                                <img src={opt.avatar} alt="" className="search-dropdown-avatar-img" />
                                            ) : (
                                                <span className="search-dropdown-initials">{opt.label.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="search-dropdown-text-container">
                                            <span className="search-dropdown-label">{opt.label}</span>
                                            {opt.subLabel && (
                                                <span className="search-dropdown-sublabel">{opt.subLabel}</span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="search-dropdown-empty">
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
