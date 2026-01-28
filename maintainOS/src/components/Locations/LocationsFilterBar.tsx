import { FileText, List, Network, Settings, User } from "lucide-react";
import FilterBar from "../utils/FilterBar";

// ✅ REDUX INTEGRATION
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import type { AppDispatch, RootState } from "../../store";
import { fetchFilterData } from "../../store/locations/locations.thunks";

const ALL_FILTERS = [
  // Changed key 'teamsInCharge' to 'teams' to match API 'teamsOneOf'
  { key: "teams", label: "Teams in Charge", icon: <User size={16} />, disableAutoFetch: true },
  { key: "createdBy", label: "Created By", icon: <User size={16} />, disableAutoFetch: true },
  { key: "asset", label: "Asset", icon: <Network size={16} />, disableAutoFetch: true },
  { key: "part", label: "Part", icon: <Settings size={16} />, disableAutoFetch: true },
  { key: "procedure", label: "Procedure", icon: <List size={16} />, disableAutoFetch: true },
  { key: "vendor", label: "Vendor", icon: <FileText size={16} />, disableAutoFetch: true },
];

interface LocationsFilterBarProps {
  onParamsChange?: (params: any) => void;
}

export default function LocationsFilterBar({ onParamsChange }: LocationsFilterBarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { filterData } = useSelector((state: RootState) => state.locations);

  useEffect(() => {
    dispatch(fetchFilterData());
  }, [dispatch]);

  const filters = useMemo(() => {
    if (!filterData) return ALL_FILTERS;

    return ALL_FILTERS.map((filter) => {
      let options: any[] = [];

      switch (filter.key) {
        case "teams":
          options = filterData.teams || [];
          break;
        case "createdBy":
          options = filterData.users || [];
          break;
        case "asset":
          options = filterData.assets || [];
          break;
        case "part":
          options = filterData.parts || [];
          break;
        case "procedure":
          options = filterData.procedures || [];
          break;
        case "vendor":
          options = filterData.vendors || [];
          break;
        default:
          return filter;
      }

      const mappedOptions = options.map((item: any) => ({
        label: item.name,
        value: item.id
      }));

      return {
        ...filter,
        options: mappedOptions.length > 0 ? mappedOptions : []
      };
    });
  }, [filterData]);

  return (
    <div className="w-full">
      <FilterBar
        allFilters={filters}
        defaultKeys={["teams", "createdBy", "asset"]}
        onParamsChange={onParamsChange}
      />
    </div>
  );
}