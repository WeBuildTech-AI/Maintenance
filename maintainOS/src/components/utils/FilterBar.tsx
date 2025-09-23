import React, { useState } from "react";
import { Plus } from "lucide-react";

type FilterOption = {
  key: string;
  label: string;
  icon?: React.ReactNode;
};

// Dummy chip UI
function FilterChip({ filter }: { filter: FilterOption }) {
  return (
    <button className="flex items-center gap-2 border rounded-md px-3 py-1 text-sm hover:bg-accent transition">
      <span className="text-orange-500">{filter.icon}</span>
      {filter.label}
    </button>
  );
}

type FilterBarProps = {
  allFilters: FilterOption[];
  defaultKeys?: string[];
};

export default function FilterBar({ allFilters, defaultKeys = [] }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>(defaultKeys);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const availableFilters = allFilters.filter(
    f => !activeFilters.includes(f.key) &&
         f.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addFilter = (key: string) => {
    setActiveFilters(prev => [...prev, key]);
    setShowMenu(false);
    setSearchQuery("");
  };

  return (
    <div className="flex gap-2 bg-white" >
      {activeFilters.map(key => {
        const filter = allFilters.find(f => f.key === key)!;
        return <FilterChip key={key} filter={filter} />;
      })}

      <div className="filterbar relative bg-white">
        <button
          className="flex items-center gap-2 border rounded-md px-3 py-1 text-sm hover:bg-accent transition"
          onClick={() => setShowMenu(p => !p)}
        >
          <Plus size={16} className="text-orange-500" /> Add Filter
        </button>

        {showMenu && (
          <>
            {/* Overlay */}
            {/* <div
              className="fixed inset-0 bg-black/20 z-10"
              onClick={() => setShowMenu(false)}
            /> */}
            {/* Popup */}
            
            <div className="absolute top-full mt-1 w-64 bg-gray-50 border rounded-md shadow-lg z-20">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border-b text-sm focus:outline-none"
              />
              <div className="max-h-60 overflow-auto">
                {availableFilters.length > 0 ? (
                  availableFilters.map(f => (
                    <div
                      key={f.key}
                      onClick={() => addFilter(f.key)}
                      className="px-3 py-2 text-sm hover:bg-accent cursor-pointer flex gap-2 items-center"
                    >
                      <span className="text-orange-500">{f.icon}</span>
                      {f.label}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
