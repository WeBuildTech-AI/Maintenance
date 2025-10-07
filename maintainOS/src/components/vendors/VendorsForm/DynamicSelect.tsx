import React from "react";
import { ChevronDown, X, Loader2, Check } from "lucide-react";
import { Badge } from "../../ui/badge";

// --- Sub-components and Styles are inside this file ---

const Spinner = () => (
  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
);

// CSS styles for the manual checkbox
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
    background-color: #3b82f6; border-color: #3b82f6;
  }
  .checked .custom-checkbox-icon {
    opacity: 1;
  }
`;

// Manual Checkbox sub-component
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

// --- Main DynamicSelect Component ---

export type SelectOption = {
  id: string;
  name: string;
};

interface DynamicSelectProps {
  options: SelectOption[];
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
}

export function DynamicSelect({
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
}: DynamicSelectProps) {
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const open = activeDropdown === name;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setActiveDropdown]);

  const handleToggle = () => {
    const nextState = open ? null : name;
    if (nextState) {
      onFetch();
    }
    setActiveDropdown(nextState);
  };

  const toggleOption = (id: string) => {
    if (Array.isArray(value)) {
      const newSelected = value.includes(id)
        ? value.filter((v) => v !== id)
        : [...value, id];
      onSelect(newSelected);
    } else {
      onSelect(id);
      setActiveDropdown(null);
    }
  };

  const selectedOptions = Array.isArray(value)
    ? options.filter((opt) => value.includes(opt.id))
    : options.filter((opt) => opt.id === value);

  return (
    <div
      className={`relative ${open ? "z-50" : ""} ${className}`}
      ref={dropdownRef}
    >
      <style>{checkboxStyles}</style>

      <div
        className="flex flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white p-2 h-auto min-h-[42px] cursor-pointer"
        onClick={handleToggle}
      >
        <div className="flex flex-wrap items-center gap-1 flex-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <Badge
                key={option.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {option.name}
                {Array.isArray(value) && (
                  <button
                    className="ml-1 rounded-full outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(option.id);
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </div>

      {open && (
        <div className="absolute top-full mt-1 w-full rounded-md border bg-white z-20 max-h-60 overflow-y-auto shadow-lg">
          {loading ? (
            <div className="flex justify-center items-center p-4">
              <Spinner />
            </div>
          ) : (
            <div className="max-h-32 overflow-y-auto">
              {options.map((option) => {
                const isSelected =
                  Array.isArray(value) && value.includes(option.id);
                return (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleOption(option.id)}
                  >
                    <label className="cursor-pointer">{option.name}</label>
                    <ManualCheckbox checked={isSelected} />
                  </div>
                );
              })}
              {options.length === 0 && (
                <div className="p-3 text-muted-foreground">
                  No options found.
                </div>
              )}
            </div>
          )}

          {ctaText && onCtaClick && (
            <div
              onClick={onCtaClick}
              className="sticky bottom-0 flex items-center p-3 text-sm text-blue-600 bg-gray-50 border-t cursor-pointer hover:bg-blue-100"
            >
              <span>{ctaText}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
