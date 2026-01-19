import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Loader2, Check } from "lucide-react";
import { Badge } from "../ui/badge";

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

export interface DynamicSelectProps {
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
  onSearch?: (term: string) => void; 
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
  const inputRef = useRef<HTMLInputElement>(null); 
  const isMulti = Array.isArray(value);
  const open = activeDropdown === name;
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (open) {
            setActiveDropdown(null);
            setSearchTerm(""); 
            if (onSearch) onSearch(""); 
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setActiveDropdown, onSearch]);

  const handleToggle = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    
    const nextState = open ? null : name;
    if (nextState) {
      onFetch?.();
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
    setActiveDropdown(null);
    setSearchTerm(""); 
    if (onSearch) onSearch("");
  };

  const selectedOptions = (options || []).filter((opt) =>
    isMulti ? (value as string[]).includes(opt.id) : opt.id === value
  );

  const displayedOptions = onSearch 
    ? options 
    : options.filter(opt => opt.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // ✅ NEW: Logic for "+N" display
  const firstOption = selectedOptions[0];
  const hiddenOptions = selectedOptions.slice(1);
  const hasHidden = hiddenOptions.length > 0;

  return (
    <div className={`relative ${open ? "z-50" : ""}`} ref={dropdownRef}>
      <style>{checkboxStyles}</style>

      <div
        className="flex items-center gap-1 rounded-md border border-gray-300 bg-white py-1 px-2 min-h-[36px] cursor-pointer focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden"
        onClick={handleToggle}
      >
        <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
          
          {/* ✅ RENDER LOGIC: If Multi, show 1 + Count. If Single, show all (which is just 1) */}
          {isMulti && selectedOptions.length > 0 ? (
            <>
              {/* 1. Show First Option */}
              <div className="relative group/tag flex items-center">
                <Badge key={firstOption.id} variant="secondary" className="flex items-center gap-1 max-w-[120px] min-w-0">
                  <span className="truncate">
                    {firstOption.name.length > 9 ? firstOption.name.substring(0, 9) + "..." : firstOption.name}
                  </span>
                  <button
                    className="ml-auto rounded-full outline-none shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(firstOption.id);
                    }}
                  >
                    <X className="h-3 w-3 text-gray-500 hover:text-gray-900" />
                  </button>
                </Badge>
                
                {/* Custom Tooltip on Hover */}
                {firstOption.name.length > 9 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tag:block w-max max-w-[200px] bg-gray-900 text-white text-[10px] rounded py-1 px-2 z-[9999] shadow-lg pointer-events-none">
                        {firstOption.name}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                    </div>
                )}
              </div>

              {/* 2. Show Counter Badge if more than 1 selected */}
              {hasHidden && (
                <div className="relative group flex items-center">
                  <Badge variant="secondary" className="cursor-help bg-blue-50 text-blue-700 hover:bg-blue-100">
                    +{hiddenOptions.length}
                  </Badge>
                  
                  {/* ✅ TOOLTIP on Hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[250px] bg-gray-900 text-white text-xs rounded-md py-2 px-3 z-[9999] shadow-xl">
                    <div className="flex flex-col gap-1">
                      {hiddenOptions.map((opt) => (
                        <span key={opt.id} className="truncate border-b border-gray-700 last:border-0 pb-1 last:pb-0">
                          {opt.name}
                        </span>
                      ))}
                    </div>
                    {/* Tiny Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Standard Rendering for Single Select (or fallback)
            selectedOptions.map((option) => (
              <div key={option.id} className="relative group/tag flex items-center">
                <Badge variant="secondary" className="flex items-center gap-1 max-w-[120px] min-w-0">
                  <span className="truncate">
                    {option.name.length > 9 ? option.name.substring(0, 9) + "..." : option.name}
                  </span>
                  <button
                    className="ml-auto rounded-full outline-none shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect("");
                    }}
                  >
                    <X className="h-3 w-3 text-gray-500 hover:text-gray-900" />
                  </button>
                </Badge>

                {/* Custom Tooltip on Hover */}
                {option.name.length > 9 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tag:block w-max max-w-[200px] bg-gray-900 text-white text-[10px] rounded py-1 px-2 z-[9999] shadow-lg pointer-events-none">
                        {option.name}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                    </div>
                )}
              </div>
            ))
          )}
          
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-sm min-w-[20px] h-6 placeholder:text-gray-500"
            placeholder={selectedOptions.length === 0 ? placeholder : ""}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (onSearch) onSearch(e.target.value);
              if (!open) setActiveDropdown(name); 
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
        <div 
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full mt-1 w-full rounded-md border bg-white z-20 max-h-60 overflow-y-auto shadow-lg"
        >
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
                 e.stopPropagation();
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
