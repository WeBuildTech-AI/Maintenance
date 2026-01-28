import { Tag, FileText, Repeat, Settings, MapPin, Factory, Wrench, Hash, Users, Layers, Calendar } from "lucide-react";
import FilterBar from "../../utils/FilterBar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import type { AppDispatch, RootState } from "../../../store";
import { fetchFilterData } from "../../../store/assets/assets.thunks";

// ✅ Updated ALL_FILTERS with static options for Criticality and Status
const ALL_FILTERS = [
  {
    key: "criticality",
    label: "Criticality",
    icon: <Tag size={16} />,
    // 👇 Added User's Requested Options
    options: [
      { label: "High", value: "high" },
      { label: "Medium", value: "medium" },
      { label: "Low", value: "low" }
    ]
  },
  {
    key: "status",
    label: "Status",
    icon: <Tag size={16} />,
    // 👇 Added User's Requested Options
    options: [
      { label: "Online", value: "online" },
      { label: "Offline", value: "offline" },
      { label: "Do Not Track", value: "doNotTrack" }
    ]
  },
  { key: "downtimeReason", label: "Downtime Reason", icon: <FileText size={16} />, disableAutoFetch: true },
  { key: "downtimeType", label: "Downtime Type", icon: <FileText size={16} />, disableAutoFetch: true },
  { key: "description", label: "Description", icon: <FileText size={16} />, disableAutoFetch: true },
  { key: "workOrderRecurrence", label: "Work Order Recurrence", icon: <Repeat size={16} />, disableAutoFetch: true },
  { key: "asset", label: "Asset", icon: <Settings size={16} />, disableAutoFetch: true },
  { key: "location", label: "Location", icon: <MapPin size={16} />, disableAutoFetch: true },
  { key: "manufacturer", label: "Manufacturer", icon: <Factory size={16} />, disableAutoFetch: true },
  { key: "model", label: "Model", icon: <FileText size={16} />, disableAutoFetch: true },
  { key: "part", label: "Part", icon: <Settings size={16} />, disableAutoFetch: true },
  { key: "procedure", label: "Procedure", icon: <Wrench size={16} />, disableAutoFetch: true },
  { key: "serialNumber", label: "Serial Number", icon: <Hash size={16} />, disableAutoFetch: true },
  { key: "teamsInCharge", label: "Teams in Charge", icon: <Users size={16} />, disableAutoFetch: true },
  { key: "assetTypes", label: "Asset Types", icon: <Layers size={16} />, disableAutoFetch: true },
  { key: "vendor", label: "Vendor", icon: <Factory size={16} />, disableAutoFetch: true },
  { key: "year", label: "Year", icon: <Calendar size={16} />, disableAutoFetch: true },
];

interface AssetFilterBarProps {
  onParamsChange?: (params: any) => void;
}

export default function AssetFilterBar({ onParamsChange }: AssetFilterBarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { filterData } = useSelector((state: RootState) => state.assets);

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
        case "part":
          options = filterData.parts || [];
          break;
        case "vendor":
          options = filterData.vendors || [];
          break;
        case "manufacturer":
          options = filterData.manufacturers || [];
          break;
        case "teamsInCharge":
          options = filterData.teams || [];
          break;
        case "assetTypes":
          options = filterData.assetTypes || [];
          break;
        case "procedure":
          options = filterData.procedures || [];
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
      defaultKeys={[
        "criticality",
        "status",
        "asset",
        "location"
      ]}
      onParamsChange={onParamsChange}
    />
  );
}