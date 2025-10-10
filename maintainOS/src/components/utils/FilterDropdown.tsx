import React, { useState, useRef, useEffect } from "react";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Search,
  MapPin,
  Package,
  Wrench,
  UserCog,
  FileText,
} from "lucide-react";
import { fetchFilterData } from "../utils/filterDataFetcher";

interface FilterDropdownProps {
  title: string;
  options: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelect: (option: string) => void;
  onDelete: () => void;
  selectedOptions: string[];
  onClose?: () => void;
}

export function FilterDropdown({
  title,
  options,
  searchQuery,
  setSearchQuery,
  onSelect,
  onDelete,
  selectedOptions,
  onClose,
}: FilterDropdownProps) {
  const [condition, setCondition] = useState("One of");
  const [showConditionMenu, setShowConditionMenu] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);

  // ✅ Auto-fetch data for all supported dropdowns
  useEffect(() => {
    const fetchData = async () => {
      const type = title.toLowerCase();
      if (
        [
          "location",
          "asset",
          "assets",
          "parts",
          "part",
          "vendor",
          "vendors",
          "procedure",
          "procedures",
        ].includes(type)
      ) {
        setLoading(true);
        const { data } = await fetchFilterData(type);
        setDynamicOptions(data || []);
        setLoading(false);
      }
    };
    fetchData();
  }, [title]);

  // ✅ Filter results
  const filtered =
    [
      "location",
      "asset",
      "assets",
      "parts",
      "part",
      "vendor",
      "vendors",
      "procedure",
      "procedures",
    ].includes(title.toLowerCase())
      ? dynamicOptions.filter((opt) =>
          (opt.name || "").toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options
          .filter((o) => o.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((o) => ({ name: o, image: null }));

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const getFallbackIcon = () => {
    const t = title.toLowerCase();
    if (t.includes("location"))
      return <MapPin size={16} className="text-blue-600" />;
    if (t.includes("asset"))
      return <Package size={16} className="text-green-600" />;
    if (t.includes("part"))
      return <Wrench size={16} className="text-amber-600" />;
    if (t.includes("vendor"))
      return <UserCog size={16} className="text-orange-600" />;
    if (t.includes("procedure"))
      return <FileText size={16} className="text-purple-600" />;
    return <MapPin size={16} className="text-gray-400" />;
  };

  // Prevent accidental close when clicking inside
  useEffect(() => {
    const preventClose = (e: MouseEvent) => {
      if (dropdownRef.current?.contains(e.target as Node)) e.stopPropagation();
    };
    document.addEventListener("mousedown", preventClose, true);
    return () => document.removeEventListener("mousedown", preventClose, true);
  }, []);

  // Close on outside click or ESC
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const inside = dropdownRef.current?.contains(e.target as Node);
      if (!inside) {
        setShowConditionMenu(false);
        if (onClose) onClose();
        else setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowConditionMenu(false);
        if (onClose) onClose();
        else setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="w-80 bg-white border rounded-lg shadow-xl z-50"
      onClick={stopPropagation}
      style={{ display: isOpen ? "block" : "none" }}
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
            placeholder={`Search ${title}`}
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
            const valueForSelect = opt.id ?? opt.name;
            return (
              <div
                key={opt.id || opt.name}
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
                      { id: opt.id, name: opt.name }
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
