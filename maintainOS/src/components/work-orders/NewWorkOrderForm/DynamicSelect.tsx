import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Loader2, Check } from "lucide-react";
import { Badge } from "../../ui/badge";

const Spinner = () => (
  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
);

const checkboxStyles = `
  .custom-checkbox-box {
    width: 1rem;
    height: 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 150ms, border-color 150ms;
  }
  .custom-checkbox-icon {
    color: white;
    width: 0.75rem;
    height: 0.75rem;
    stroke-width: 3;
    opacity: 0;
    transition: opacity 150ms;
  }
  .checked .custom-checkbox-box {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }
  .checked .custom-checkbox-icon {
    opacity: 1;
  }
`;

const ManualCheckbox = ({ checked }: { checked: boolean }) => (
  <div className={checked ? "checked" : ""}>
    <div className="custom-checkbox-box">
      <Check className="custom-checkbox-icon" />
    </div>
  </div>
);

export type SelectOption = { id: string; name: string };

interface DynamicSelectProps {
  options?: SelectOption[];
  value: string | string[];
  onSelect: (value: string | string[]) => void;
  onFetch: () => void;
  loading: boolean;
  placeholder?: string;
  className?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  name: string;
  activeDropdown: string | null;
  setActiveDropdown: (name: string | null) => void;
  onSearch?: (term: string) => void; // ✅ Added optional search prop
}

export function DynamicSelect({
  options = [],
  value,
  onSelect,
  onFetch,
  loading,
  placeholder = "Select...",
  ctaText,
  onCtaClick,
  name,
  activeDropdown,
  setActiveDropdown,
  onSearch,
}: DynamicSelectProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // ✅ Ref for the search input
  const isMulti = Array.isArray(value);
  const open = activeDropdown === name;
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Local search state

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setSearchTerm(""); // Reset search on close
        if (onSearch) onSearch(""); 
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setActiveDropdown, onSearch]);

  const handleToggle = (e: React.MouseEvent) => {
    // Prevent closing if clicking the input itself
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    
    const nextState = open ? null : name;
    if (nextState) {
      onFetch?.();
      // Focus input when opening
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    setActiveDropdown(nextState);
  };

  const toggleOption = (id: string) => {
    if (isMulti) {
      const arr = value as string[];
      onSelect(arr.includes(id) ? arr.filter((v) => v !== id) : [...arr, id]);
    } else {
      onSelect(id === value ? "" : id);
    }
    // ✅ ALWAYS Close dropdown after selection (Single or Multi)
    setActiveDropdown(null);
    setSearchTerm("");
    if (onSearch) onSearch("");
  };

  const selectedOptions = (options || []).filter((opt) =>
    isMulti ? (value as string[]).includes(opt.id) : opt.id === value
  );

  // ✅ Filter options locally if no external onSearch is provided
  const displayedOptions = onSearch 
    ? options 
    : options.filter(opt => opt.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={`relative ${open ? "z-50" : ""}`} ref={dropdownRef}>
      <style>{checkboxStyles}</style>

      <div
        className="flex flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white p-2 min-h-[42px] cursor-pointer focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        onClick={handleToggle}
      >
        <div className="flex flex-wrap items-center gap-1 flex-1">
          {selectedOptions.map((option) => (
            <Badge key={option.id} variant="secondary" className="flex items-center gap-1">
              {option.name}
              {isMulti && (
                <button
                  className="ml-1 rounded-full outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option.id);
                  }}
                >
                  <X className="h-3 w-3 text-gray-500 hover:text-gray-900" />
                </button>
              )}
            </Badge>
          ))}
          
          {/* ✅ Search Input inside the Chip area */}
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-sm min-w-[60px] h-6 placeholder:text-gray-500"
            placeholder={selectedOptions.length === 0 ? placeholder : ""}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (onSearch) onSearch(e.target.value);
              if (!open) setActiveDropdown(name); // Open dropdown when typing
            }}
            onFocus={() => {
               if(!open) {
                 setActiveDropdown(name);
                 onFetch?.();
               }
            }}
          />
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 opacity-50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div className="absolute top-full mt-1 w-full rounded-md border bg-white z-20 max-h-60 overflow-y-auto shadow-lg">
          {loading ? (
            <div className="flex justify-center items-center p-4">
              <Spinner />
            </div>
          ) : (
            <div>
              {displayedOptions.map((option) => {
                const isSelected = isMulti
                  ? (value as string[]).includes(option.id)
                  : value === option.id;
                return (
                  <div
                    key={option.id}
                    className="flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 text-sm"
                    onClick={() => toggleOption(option.id)}
                  >
                    {isMulti ? (
                      <ManualCheckbox checked={isSelected} />
                    ) : (
                      <div
                        className={`w-2 h-2 rounded-full mr-1 ${
                          isSelected ? "bg-blue-500" : "bg-transparent"
                        }`}
                      ></div>
                    )}
                    <label className="flex-1 cursor-pointer text-gray-700">{option.name}</label>
                    {!isMulti && isSelected && (
                      <Check className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                );
              })}
              {displayedOptions.length === 0 && (
                <div className="p-3 text-gray-500 text-sm">No options found.</div>
              )}
            </div>
          )}

          {ctaText && onCtaClick && (
            <div
              onClick={(e) => {
                 e.stopPropagation(); // Stop bubbling so input blur doesn't close strictly before click
                 onCtaClick();
                 setActiveDropdown(null);
              }}
              className="sticky bottom-0 flex items-center p-3 text-sm font-medium text-blue-600 bg-gray-50 border-t cursor-pointer hover:bg-blue-100"
            >
              <span>{ctaText}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}