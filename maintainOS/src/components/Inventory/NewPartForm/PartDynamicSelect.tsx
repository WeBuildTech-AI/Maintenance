"use client";

import { Check, ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import React from "react";
import { Badge } from "../../ui/badge";

// ------------------- Spinner -------------------
const Spinner = () => (
  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
);

// ------------------- Checkbox Styles -------------------
const checkboxStyles = `
  .custom-checkbox-box {
    width: 1rem; height: 1rem; border: 1px solid #d1d5db; border-radius: 0.25rem;
    display: flex; align-items: center; justify-content: center;
    transition: background-color 150ms, border-color 150ms;
  }
  .custom-checkbox-icon {
    color: white; width: 0.75rem; height: 0.75rem; stroke-width: 3; opacity: 0;
    transition: opacity 150ms;
  }
  .checked .custom-checkbox-box {
    background-color: #f97316; border-color: #f97316;
  }
  .checked .custom-checkbox-icon {
    opacity: 1;
  }
`;

// ------------------- Manual Checkbox -------------------
interface ManualCheckboxProps {
  checked: boolean;
}
const ManualCheckbox = ({ checked }: ManualCheckboxProps) => (
  <div className={checked ? "checked" : ""}>
    <div className="custom-checkbox-box">
      <Check className="custom-checkbox-icon" />
    </div>
  </div>
);

// ------------------- Types -------------------
export type PartSelectOption = {
  id: string;
  name: string;
};

interface PartDynamicSelectProps {
  options: PartSelectOption[];
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
  isMulti?: boolean;
  limitOptions?: number;
}

// ------------------- Main Component -------------------
export function PartDynamicSelect({
  options,
  value,
  onSelect,
  onFetch,
  loading,
  placeholder = "Select...",
  className,
  ctaText,
  onCtaClick,
  name,
  activeDropdown,
  setActiveDropdown,
  isMulti = false,
  limitOptions = 3, 
}: PartDynamicSelectProps) {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const open = activeDropdown === name;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setActiveDropdown]);

  const handleToggle = () => {
    const nextState = open ? null : name;
    if (nextState) onFetch();
    setActiveDropdown(nextState);
  };

  const selectedValues = React.useMemo(() => {
    if (isMulti) {
      if (Array.isArray(value)) return value;
      if (typeof value === "string" && value !== "") return [value];
      return [];
    }
    return typeof value === "string" ? value : "";
  }, [value, isMulti]);

  // ✅ Multi-select stays open
  const toggleOption = (id: string) => {
    if (isMulti) {
      const current = Array.isArray(selectedValues) ? selectedValues : [];
      const newSelected = current.includes(id)
        ? current.filter((v) => v !== id)
        : [...current, id];
      onSelect(newSelected);
    } else {
      onSelect(id);
      setActiveDropdown(null); // close only single-select
    }
  };

  const selectedOptions = isMulti
    ? options.filter((opt) => (selectedValues as string[]).includes(opt.id))
    : options.filter((opt) => opt.id === selectedValues);

  return (
    <div ref={dropdownRef} className={`relative ${open ? "z-50" : ""} ${className || ""}`}>
      <style>{checkboxStyles}</style>

      {/* Input Display */}
      <div
        className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md bg-white px-3 py-2 min-h-[42px] cursor-pointer shadow-sm transition-all"
        onClick={handleToggle}
      >
        <div className="flex flex-wrap items-center gap-1 flex-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <Badge
                key={option.id}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 w-full"
              >
                <span className="whitespace-normal break-all">
                  {option.name}
                </span>
                  
                <button
                  className="ml-1 rounded-full outline-none hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMulti) toggleOption(option.id);
                    else onSelect("");
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          )}
        </div>

        {open ? <ChevronUp className="h-4 w-4 opacity-50" /> : <ChevronDown className="h-4 w-4 opacity-50" />}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1 w-full rounded-md border bg-white z-20 overflow-y-auto shadow-lg"style={{ maxHeight: `${limitOptions * 48}px` }}>
          {loading ? (
            <div className="flex justify-center items-center p-4">
              <Spinner />
            </div>
          ) : (
            <div>
              {options.map((option) => {
                const isSelected = isMulti
                  ? (selectedValues as string[]).includes(option.id)
                  : option.id === selectedValues;
                return (
                  <div
                    key={option.id}
                    className="flex items-center justify-between border-b border-gray-100 cursor-pointer hover:bg-gray-50 px-3 py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(option.id);
                    }}
                  >
                    <label
                      className={`cursor-pointer pl-4 ${
                        isSelected ? "text-gray-900 font-medium" : "text-gray-700 font-normal"
                      }`}
                    >
                      {option.name}
                    </label>
                    <ManualCheckbox checked={isSelected} />
                  </div>
                );
              })}

              {options.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">No options found.</div>
              )}
            </div>
          )}

          {ctaText && onCtaClick && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onCtaClick();
              }}
              className="sticky bottom-0 flex items-center p-3 text-sm text-orange-600 bg-gray-50 border-t cursor-pointer hover:bg-orange-100"
            >
              <span>{ctaText}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
