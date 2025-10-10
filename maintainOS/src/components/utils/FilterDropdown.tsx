import React, { useState, useRef, useEffect } from "react";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Search,
  MapPin,
  Package,
  Wrench,
} from "lucide-react";
import { fetchFilterData } from "./../utils/filterDataFetcher";

interface FilterDropdownProps {
  title: string;
  options: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelect: (option: string) => void;
  onDelete: () => void;
  selectedOptions: string[];
}

export function FilterDropdown({
  title,
  options,
  searchQuery,
  setSearchQuery,
  onSelect,
  onDelete,
  selectedOptions,
}: FilterDropdownProps) {
  const [condition, setCondition] = useState("One of");
  const [showConditionMenu, setShowConditionMenu] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-fetch dynamic options for Location
  useEffect(() => {
    const fetchData = async () => {
      if (title === "Location") {
        setLoading(true);
        const { data } = await fetchFilterData("location");
        setDynamicOptions(data);
        setLoading(false);
      }
    };
    fetchData();
  }, [title]);

  // If dynamicOptions exist (Location), use those; else fallback to provided options
  const filtered =
    title === "Location"
      ? dynamicOptions.filter((l) =>
          (l.name || "").toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options
          .filter((o) => o.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((o) => ({ name: o, image: null }));

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const getFallbackIcon = () => {
    if (title.toLowerCase().includes("location"))
      return <MapPin size={16} className="text-blue-600" />;
    if (title.toLowerCase().includes("asset"))
      return <Package size={16} className="text-green-600" />;
    if (title.toLowerCase().includes("vendor"))
      return <Wrench size={16} className="text-orange-600" />;
    return <MapPin size={16} className="text-gray-400" />;
  };

  // Prevent closing when clicking inside
  useEffect(() => {
    const preventClose = (e: MouseEvent) => {
      if (dropdownRef.current?.contains(e.target as Node)) e.stopPropagation();
    };
    document.addEventListener("mousedown", preventClose, true);
    return () => document.removeEventListener("mousedown", preventClose, true);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="w-80 bg-white border rounded-lg shadow-xl z-50"
      onClick={stopPropagation}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-3 py-2 border-b text-sm font-semibold text-gray-700 relative">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{title}</span>

          {/* Condition Selector */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConditionMenu((p) => !p);
              }}
              className="text-blue-600 flex items-center gap-1 font-medium focus:outline-none"
            >
              {condition}
              {showConditionMenu ? (
                <ChevronUp size={14} className="text-gray-500" />
              ) : (
                <ChevronDown size={14} className="text-gray-500" />
              )}
            </button>

            {showConditionMenu && (
              <div
                className="absolute top-[115%] left-1/2 -translate-x-1/2 bg-white border rounded-md shadow-md z-50"
                style={{ width: "200px" }}
                onClick={stopPropagation}
              >
                {["One of", "None of", "Is empty", "Is not empty"].map((c) => (
                  <div
                    key={c}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCondition(c);
                      setShowConditionMenu(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                      condition === c
                        ? "text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Icon */}
        <Trash2
          size={16}
          className="cursor-pointer text-gray-500 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      </div>

      {/* Search Box */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 border border-blue-400 rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm outline-none placeholder-gray-400"
            onClick={stopPropagation}
          />
        </div>
      </div>

      {/* Options List */}
      <div className="max-h-56 overflow-y-auto">
        {loading ? (
          <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
        ) : filtered.length > 0 ? (
          filtered.map((opt: any, idx: number) => {
            // ✅ for Location we send/track ID; for others we send/track name
            const valueForSelect =
              title === "Location" ? (opt.id ?? opt.name) : opt.name;

            return (
              <div
                key={opt.name}
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer ${
                  idx !== filtered.length - 1 ? "border-b" : ""
                } hover:bg-gray-50`}
              >
                <div className="flex items-center gap-2">
                  {opt.image ? (
                    <img
                      src={opt.image}
                      alt={opt.name}
                      className="w-6 h-6 rounded-full object-cover border"
                    />
                  ) : (
                    getFallbackIcon()
                  )}
                  <span className="text-gray-700">{opt.name}</span>
                </div>

                <input
                  type="checkbox"
                  checked={selectedOptions.includes(valueForSelect)}
                  onChange={() => {
                    console.log(
                      "%c🟢 SELECTED OPTION:",
                      "color:#10b981;font-weight:bold;",
                      {
                        id: opt.id || "(no id)",
                        name: opt.name,
                        valueSentUp: valueForSelect,
                      }
                    );
                    onSelect(valueForSelect);
                  }}
                  className="h-4 w-4 cursor-pointer accent-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            );
          })
        ) : (
          <div className="px-3 py-2 text-sm text-gray-500">No results</div>
        )}
      </div>
    </div>
  );
}
