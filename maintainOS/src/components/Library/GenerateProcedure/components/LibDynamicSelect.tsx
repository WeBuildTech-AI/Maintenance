"use client";

import React from "react";
import { Check, ChevronDown, ChevronUp, Loader2, X } from "lucide-react";

/**
 * LibDynamicSelect.tsx
 * Standalone select component (single/multi) with outside click handling,
 * loading state, CTA, and checkbox visuals.
 *
 * Usage:
 * import { LibDynamicSelect } from "./LibDynamicSelect";
 */

type LibSelectOption = {
  id: string;
  label: string;
};

interface LibDynamicSelectProps {
  options: LibSelectOption[];
  value: string | string[]; // selected id or array of ids
  onChange: (value: string | string[]) => void;
  fetchOptions: () => void; // called when opening dropdown (optional)
  loading?: boolean;
  placeholder?: string;
  name: string; // unique name per instance
  activeDropdown: string | null;
  setActiveDropdown: (name: string | null) => void;
  isMulti?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
  // --- 👇 [NEW] Naya prop add karein ---
  icon?: React.ReactNode; 
}

const spinner = <Loader2 className="h-5 w-5 animate-spin text-gray-400" />;

const checkboxStyles = `
  .custom-checkbox-box {
    width: 1rem; height: 1rem; border: 1px solid #e5e7eb; border-radius: 0.25rem;
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

export function LibDynamicSelect({
  options,
  value,
  onChange,
  fetchOptions,
  loading = false,
  placeholder = "Start typing...",
  name,
  activeDropdown,
  setActiveDropdown,
  isMulti = false,
  ctaText,
  onCtaClick,
  className,
  // --- 👇 [NEW] Naya prop read karein ---
  icon,
}: LibDynamicSelectProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const open = activeDropdown === name;

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open, setActiveDropdown]);

  const toggleDropdown = () => {
    const next = open ? null : name;
    if (next && fetchOptions) fetchOptions();
    setActiveDropdown(next);
  };

  const selectedVals = React.useMemo(() => {
    if (isMulti) {
      if (Array.isArray(value)) return value;
      return value ? [value] : [];
    }
    return typeof value === "string" ? value : "";
  }, [value, isMulti]);

  const toggleSelect = (id: string) => {
    if (isMulti) {
      const current = Array.isArray(selectedVals) ? selectedVals : [];
      const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
      onChange(next);
    } else {
      onChange(id);
      setActiveDropdown(null);
    }
  };

  const selectedOptions = isMulti
    ? options.filter((o) => (selectedVals as string[]).includes(o.id))
    : options.filter((o) => o.id === selectedVals);

  return (
    <div ref={ref} className={`relative ${className || "w-full"}`}>
      <style>{checkboxStyles}</style>

      <div
        className="flex items-center gap-2 border border-gray-200 rounded-md bg-white px-3 py-2 min-h-[44px] cursor-pointer"
        onClick={toggleDropdown}
      >
        {/* --- 👇 [NEW] Icon ko yahaan render karein --- */}
        {icon && <div className="flex-shrink-0">{icon}</div>}
        
        <div className="flex-1 flex flex-wrap gap-2">
          {selectedOptions.length ? (
            selectedOptions.map((s) => (
              <div 
                key={s.id} 
                // --- [FIX] Pill style ko hatayein agar single select hai ---
                className={`inline-flex items-center gap-1 ${isMulti ? 'bg-gray-100 px-2 py-1 rounded' : 'bg-transparent p-0'} text-sm`}
              >
                {s.label}
                {/* --- [FIX] 'X' button ko logic add karein --- */}
                {isMulti && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(s.id);
                    }}
                    className="ml-1 text-xs hover:text-red-600"
                    aria-label="remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-400">{placeholder}</span>
          )}
        </div>

        {/* --- [FIX] 'X' button (single select ke liye) --- */}
        {!isMulti && selectedOptions.length > 0 && (
           <button
             onClick={(e) => {
               e.stopPropagation();
               onChange(""); // Value ko clear karein
             }}
             className="text-gray-400 hover:text-gray-600"
             aria-label="clear selection"
           >
             <X className="h-4 w-4" />
           </button>
        )}

        <div className="text-gray-400 ml-2">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
      </div>

      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded-md z-40 max-h-56 overflow-auto shadow-lg">
          {loading ? (
            <div className="p-4 flex justify-center">{spinner}</div>
          ) : (
            <div>
              {options.map((opt) => {
                const isSelected = isMulti ? (selectedVals as string[]).includes(opt.id) : opt.id === selectedVals;
                return (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(opt.id);
                    }}
                  >
                    <div className={`${isSelected ? "font-medium text-gray-900" : "text-gray-700"}`}>{opt.label}</div>
                    {/* --- [FIX] Checkbox ko sirf multi-select ke liye dikhayein --- */}
                    {isMulti && (
                      <div className={isSelected ? "checked" : ""}>
                        <div className="custom-checkbox-box">
                          <Check className="custom-checkbox-icon" />
                        </div>
                      </div>
                    )}
                    {/* --- [FIX] Single-select ke liye selected checkmark dikhayein --- */}
                    {!isMulti && isSelected && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                );
              })}
              {options.length === 0 && <div className="p-3 text-sm text-gray-500">No results</div>}
            </div>
          )}

          {ctaText && onCtaClick && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onCtaClick();
              }}
              className="sticky bottom-0 px-3 py-2 bg-gray-50 border-t text-sm text-blue-600 cursor-pointer hover:bg-gray-100"
            >
              {ctaText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LibDynamicSelect;