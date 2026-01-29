import { User, MapPin, Tag, Settings, Layers, Repeat, FileText, ClipboardList } from "lucide-react";
import FilterBar from "../utils/FilterBar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import type { AppDispatch, RootState } from "../../store";
import { fetchFilterData } from "../../store/parts/parts.thunks";

const ALL_FILTERS = [
  // --- API FILTERS ---
  { key: "location", label: "Location", icon: <MapPin size={16} />, disableAutoFetch: true },
  { key: "asset", label: "Asset", icon: <Settings size={16} />, disableAutoFetch: true },
  { key: "vendor", label: "Vendor", icon: <Settings size={16} />, disableAutoFetch: true },
  // ✅ ADDED TEAMS IN CHARGE FILTER
  { key: "team", label: "Teams in Charge", icon: <User size={16} />, disableAutoFetch: true },

  // --- PART SPECIFIC FILTERS ---
  {
    key: "stockStatus",
    label: "Stock Status",
    icon: <ClipboardList size={16} />,
    options: [
      { label: "Needs Restock", value: "needs_restock" },
      { label: "In Stock", value: "in_stock" },
      { label: "Out of Stock", value: "out_of_stock" }
    ]
  },
  { key: "partType", label: "Part Type", icon: <Tag size={16} /> }, // Maps to partTypeContains
  { key: "area", label: "Area", icon: <MapPin size={16} /> }, // Maps to areaContains
  { key: "description", label: "Description", icon: <FileText size={16} /> },

  {
    key: "workOrderRecurrence",
    label: "Recurrence",
    icon: <Repeat size={16} />,
    options: [
      { label: "Repeating", value: "has_repeating" },
      { label: "Non-Repeating", value: "no_repeating" }
    ]
  },
];

interface InventoryFilterBarProps {
  onParamsChange?: (params: any) => void;
}

export default function InventoryFilterBar({ onParamsChange }: InventoryFilterBarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { filterData } = useSelector((state: RootState) => state.parts);

  useEffect(() => {
    // Dispatch thunk to fetch all filter data in parallel (cached by Redux)
    dispatch(fetchFilterData());
  }, [dispatch]);

  const filters = useMemo(() => {
    if (!filterData) return ALL_FILTERS;

    return ALL_FILTERS.map((filter) => {
      let options: any[] = [];

      switch (filter.key) {
        case "location":
          options = filterData.locations || [];
          break;
        case "asset":
          options = filterData.assets || [];
          break;
        case "vendor":
          options = filterData.vendors || [];
          break;
        case "team":
          options = filterData.teams || [];
          break;
        default:
          return filter;
      }

      // Map to DropdownOption format
      const mappedOptions = options.map((item: any) => ({
        label: item.name,
        value: item.id
      }));

      return {
        ...filter,
        options: mappedOptions.length > 0 ? mappedOptions : filter.options
      };
    });
  }, [filterData]);

  return (
    <FilterBar
      allFilters={filters}
      defaultKeys={["stockStatus", "partType", "location"]}
      onParamsChange={onParamsChange}
    />
  );
}