// src/components/utils/FilterBar.tsx

import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, CheckCircle } from "lucide-react";
import { FilterDropdown, DropdownOption } from "./FilterDropdown";
import { buildQueryParams, FilterStateItem } from "./../utils/queryBuilder";

type FilterOption = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  options?: (string | DropdownOption)[]; 
  hideCondition?: boolean; // ✅ Added support for hiding condition
};

const MAX_VISIBLE = 4;

export default function FilterBar({
  allFilters,
  defaultKeys = [],
  onParamsChange,
}: {
  allFilters: FilterOption[];
  defaultKeys?: string[];
  onParamsChange?: (params: Record<string, any>) => void;
}) {
  const [activeFilters, setActiveFilters] = useState<string[]>(defaultKeys);
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [filterState, setFilterState] = useState<Record<string, FilterStateItem>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // ... (useEffect for outside click - No Change)
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);
        const clickedInsideModal = modalRef.current && modalRef.current.contains(target);
        const clickedInsideAddMenu = addMenuRef.current && addMenuRef.current.contains(target);
  
        if (!clickedInsideDropdown && !clickedInsideAddMenu && !clickedInsideModal) {
          setOpenFilterKey(null);
          setShowAddMenu(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  // ... (useEffect for onParamsChange - No Change)
  useEffect(() => {
      const apiParams = buildQueryParams(filterState);
      if (onParamsChange) {
        onParamsChange(apiParams);
      }
    }, [filterState, onParamsChange]);

  // ... (Handlers - No Change)
  const toggleDropdown = (key: string) => {
      setShowAddMenu(false);
      setOpenFilterKey((prev) => (prev === key ? null : key));
    };
  
    const handleSelect = (filterKey: string, optionId: string) => {
      setFilterState((prev) => {
        const current = prev[filterKey] || { values: [], condition: "One of" };
        const currentValues = current.values || [];
        const nextValues = currentValues.includes(optionId)
          ? currentValues.filter((o) => o !== optionId)
          : [...currentValues, optionId];
        return { ...prev, [filterKey]: { ...current, values: nextValues } };
      });
    };
  
    const handleConditionChange = (filterKey: string, newCondition: string) => {
      setFilterState((prev) => {
        const current = prev[filterKey] || { values: [], condition: "One of" };
        return { ...prev, [filterKey]: { ...current, condition: newCondition } };
      });
    };
  
    const handleDelete = (filterKey: string) => {
      setActiveFilters((prev) => {
        const updated = prev.filter((key) => key !== filterKey);
        if (updated.length < MAX_VISIBLE) setShowAddMenu(true);
        return updated;
      });
      setFilterState((prev) => {
          const next = { ...prev };
          delete next[filterKey];
          return next;
      });
      setOpenFilterKey(null);
    };
  
    const handleAddFilter = (key: string) => {
      setActiveFilters((prev) => {
        let next = [...prev];
        if (next.includes(key)) return next;
        if (next.length >= MAX_VISIBLE) next.shift();
        next.push(key);
        return next;
      });
      setShowAddMenu(false);
    };

  const visibleFilters = activeFilters.slice(-MAX_VISIBLE);
  const hiddenFilters = allFilters.filter((f) => !visibleFilters.includes(f.key));

  const FilterChip = ({ filter, onClick }: { filter: FilterOption; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 border rounded-md px-3 py-1 text-sm hover:bg-accent transition"
    >
      <span className="text-blue-600">{filter.icon}</span>
      {filter.label}
    </button>
  );

  const shouldShowAdd = allFilters.length > MAX_VISIBLE || activeFilters.length < MAX_VISIBLE;

  return (
    <div className="flex gap-2 bg-white flex-wrap relative">
      {visibleFilters.map((key) => {
        const filter = allFilters.find((f) => f.key === key)!;
        const isOpen = openFilterKey === key;
        const currentState = filterState[key] || { values: [], condition: "One of" };

        return (
          <div key={key} className="relative" ref={isOpen ? dropdownRef : null}>
            <FilterChip filter={filter} onClick={() => toggleDropdown(key)} />
            {isOpen && (
              <div
                ref={modalRef} 
                className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-80 z-50"
              >
                <FilterDropdown
                  title={filter.label}
                  options={filter.options || []}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedOptions={currentState.values}
                  currentCondition={currentState.condition}
                  onSelect={(optId) => handleSelect(key, optId)}
                  onDelete={() => handleDelete(key)}
                  onConditionChange={(cond) => handleConditionChange(key, cond)}
                  hideCondition={filter.hideCondition} // ✅ PASSING THE NEW PROP
                />
              </div>
            )}
          </div>
        );
      })}

      {shouldShowAdd && (
        <div className="relative" ref={addMenuRef}>
          {/* ... Add Menu Button & Dropdown (Same as before) ... */}
           <button
            className="flex items-center gap-2 border rounded-md px-3 py-1 text-sm bg-white hover:bg-accent transition"
            onClick={() => {
              setOpenFilterKey(null);
              setShowAddMenu((p) => !p);
            }}
          >
            <Plus size={16} className="text-blue-600" /> Add Filter
          </button>

          {showAddMenu && (
            <div
              className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white border rounded-lg shadow-xl w-80 z-50 flex flex-col"
              style={{ maxHeight: "340px" }}
            >
             <div className="p-3 border-b sticky top-0 bg-white z-10 shadow-sm">
                <div className="flex items-center gap-2 border border-blue-400 rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500">
                  <Search size={14} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="overflow-y-auto flex-1">
                {hiddenFilters
                  .filter((f) => f.label.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((f) => (
                    <div
                      key={f.key}
                      onClick={() => handleAddFilter(f.key)}
                      className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">{f.icon}</span>
                        {f.label}
                      </div>
                      {filterState[f.key]?.values?.length > 0 && (
                        <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                {hiddenFilters.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">No filters available</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}