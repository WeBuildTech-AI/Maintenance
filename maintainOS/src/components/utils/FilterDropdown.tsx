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
  Tag,
  AlertCircle,
  Briefcase
} from "lucide-react";
import { fetchFilterData } from "../utils/filterDataFetcher";

// ✅ Updated Interface to support Label/Value pairs
export interface DropdownOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  title: string;
  // Options can be simple strings OR objects with label/value
  options: (string | DropdownOption)[]; 
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelect: (option: string) => void;
  onDelete: () => void;
  selectedOptions: string[];
  onClose?: () => void;
  currentCondition?: string;
  onConditionChange: (condition: string) => void;
  hideCondition?: boolean; // ✅ New prop to hide "One of" menu
}

export function FilterDropdown({
  title,
  options = [],
  searchQuery,
  setSearchQuery,
  onSelect,
  onDelete,
  selectedOptions,
  onClose,
  currentCondition = "One of",
  onConditionChange,
  hideCondition = false, // Default show
}: FilterDropdownProps) {
  const [condition, setCondition] = useState(currentCondition);
  const [showConditionMenu, setShowConditionMenu] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);

  // List of keys that fetch data from API
  const API_KEYS = [
    "location", "locations",
    "asset", "assets",
    "part", "parts",
    "vendor", "vendors",
    "procedure", "procedures",
    "category", "categories",
    "assigned to", "assignedto",
    "completed by", "completedby",
    "requested by", "requestedby",
    "team", "teams",
    "user", "users"
  ];

  const shouldFetchFromApi = API_KEYS.includes(title.toLowerCase());

  // ✅ Auto-fetch data ONLY for API keys
  useEffect(() => {
    const fetchData = async () => {
      if (shouldFetchFromApi) {
        setLoading(true);
        let fetchType = title.toLowerCase();
        if(fetchType.includes("assigned") || fetchType.includes("completed") || fetchType.includes("requested")) {
            fetchType = "users"; 
        }

        const { data } = await fetchFilterData(fetchType);
        setDynamicOptions(data || []);
        setLoading(false);
      }
    };
    fetchData();
  }, [title, shouldFetchFromApi]);

  useEffect(() => {
    setCondition(currentCondition);
  }, [currentCondition]);

  const handleConditionClick = (newCondition: string) => {
    setCondition(newCondition);
    onConditionChange(newCondition);
    setShowConditionMenu(false);
  };

  // ✅ NORMALIZE OPTIONS: Convert everything to { name, id } format
  // name = What shows in UI
  // id = What sends to API
  const sourceData = shouldFetchFromApi 
    ? dynamicOptions 
    : options.map(o => {
        if (typeof o === 'string') return { name: o, id: o, image: null };
        return { name: o.label, id: o.value, image: null };
    });

  // ✅ FILTER RESULTS based on Search
  const filtered = sourceData.filter((opt) => 
    (opt.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const getFallbackIcon = () => {
    const t = title.toLowerCase();
    if (t.includes("location")) return <MapPin size={16} className="text-blue-600" />;
    if (t.includes("asset")) return <Package size={16} className="text-green-600" />;
    if (t.includes("part")) return <Wrench size={16} className="text-amber-600" />;
    if (t.includes("vendor")) return <UserCog size={16} className="text-orange-600" />;
    if (t.includes("procedure")) return <FileText size={16} className="text-purple-600" />;
    if (t.includes("priority")) return <AlertCircle size={16} className="text-red-600" />;
    if (t.includes("status")) return <Tag size={16} className="text-blue-500" />;
    if (t.includes("work type")) return <Briefcase size={16} className="text-gray-600" />;
    return <Search size={16} className="text-gray-400" />;
  };

  // Close handlers...
  useEffect(() => {
    const preventClose = (e: MouseEvent) => {
      if (dropdownRef.current?.contains(e.target as Node)) e.stopPropagation();
    };
    document.addEventListener("mousedown", preventClose, true);
    return () => document.removeEventListener("mousedown", preventClose, true);
  }, []);

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

          {/* ✅ CONDITION SELECTOR (Hidden if hideCondition is true) */}
          {!hideCondition && (
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
                        handleConditionClick(c);
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
          )}
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
            // ✅ Use ID for value, Name for display
            const valueForSelect = opt.id ?? opt.name;
            const isSelected = selectedOptions.includes(valueForSelect);

            return (
              <div
                key={valueForSelect}
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer ${
                  idx !== filtered.length - 1 ? "border-b" : ""
                } hover:bg-gray-50`}
                onClick={() => onSelect(valueForSelect)}
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
                  checked={isSelected}
                  readOnly
                  className="h-4 w-4 cursor-pointer accent-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(valueForSelect);
                  }}
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