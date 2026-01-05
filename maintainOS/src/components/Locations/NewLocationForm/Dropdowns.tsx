import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { vendorService } from "../../../store/vendors";
import { locationService } from "../../../store/locations";
import Loader from "../../Loader/Loader";
import { teamService } from "../../../store/teams";

type Stage = "teams" | "vendors" | "parent";
type Option = { id: string; name: string };

type DropdownsProps = {
  stage: Stage;
  open: boolean;
  setOpen: (v: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  navigate: (path: string) => void;
  value: string | string[];
  onSelect: (val: string | string[]) => void;
  disabled?: boolean;
  // ✅ NEW PROP: Accept preloaded objects (from editData)
  preloadedOptions?: Option[];
};

export function Dropdowns({
  stage,
  open,
  setOpen,
  containerRef,
  navigate,
  value,
  onSelect,
  disabled = false,
  preloadedOptions = [],
}: DropdownsProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Store fetched options
  const [fetchedOptions, setFetchedOptions] = useState<Option[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  const label =
    stage === "teams"
      ? "Teams in Charge"
      : stage === "vendors"
      ? "Vendors"
      : "Parent Location";

  const cta =
    stage === "teams"
      ? { text: "+ Create New Team", path: "/teams/create" }
      : stage === "vendors"
      ? { text: "+ Create New Vendor", path: "/vendors/create" }
      : { text: "+ Create New Parent Location", path: "/locations" };

  // ✅ PRODUCTION FIX: Merge preloaded options with fetched options
  // This ensures pills show up immediately using 'editData' before the user even clicks the dropdown
  const allKnownOptions = useMemo(() => {
    const map = new Map<string, Option>();
    
    // 1. Add preloaded (Edit data) first
    preloadedOptions.forEach((opt) => map.set(opt.id, opt));
    
    // 2. Overwrite/Append with fetched data (if available)
    fetchedOptions.forEach((opt) => map.set(opt.id, opt));

    return Array.from(map.values());
  }, [fetchedOptions, preloadedOptions]);

  // Fetch Logic (Only on open)
  useEffect(() => {
    if (open && !hasFetched) {
      setLoading(true);
      const fetchAllData = async () => {
        try {
          let res: Option[] = [];
          if (stage === "vendors") {
            res = await vendorService.fetchVendorName();
          } else if (stage === "teams") {
            res = await teamService.fetchTeamsName();
          } else {
            res = await locationService.fetchParentLocations();
          }
          setFetchedOptions(res);
          setHasFetched(true);
        } catch (err) {
          console.error("Dropdown fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchAllData();
    }
  }, [open, hasFetched, stage]);

  // ✅ Filter logic now uses the merged 'allKnownOptions'
  const filteredOptions = useMemo(() => {
    const source = hasFetched ? fetchedOptions : allKnownOptions; // Use fetched for list if available, else mixed
    
    if (!searchQuery) return source;
    return source.filter((option) =>
      option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, fetchedOptions, allKnownOptions, hasFetched]);

  // ✅ Calculate selected items based on IDs passed in 'value' vs 'allKnownOptions'
  const selectedItems = useMemo(() => {
    const valueAsArray = Array.isArray(value) ? value : value ? [value] : [];
    if (valueAsArray.length === 0) return [];

    return allKnownOptions.filter((opt) => valueAsArray.includes(opt.id));
  }, [value, allKnownOptions]);

  const handleSelect = (option: Option) => {
    if (Array.isArray(value)) {
      const newValue = value.includes(option.id)
        ? value.filter((v) => v !== option.id)
        : [...value, option.id];
      onSelect(newValue);
      setSearchQuery("");
      searchInputRef.current?.focus();
    } else {
      onSelect(option.id);
      setSearchQuery(option.name);
      setOpen(false);
    }
  };

  const handleRemovePill = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (Array.isArray(value)) {
      onSelect(value.filter((v) => v !== id));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (typeof value === "string" && value) {
      onSelect("");
    }
  };

  const singleSelectDisplayName = selectedItems[0]?.name || "";

  return (
    <div className="relative" ref={containerRef}>
      <h3 className="mb-2 text-base font-medium text-gray-900">{label}</h3>
      <div
        className={`flex flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1 h-auto min-h-[48px] cursor-text ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && searchInputRef.current?.focus()}
      >
        <Search className="h-5 w-5 text-gray-400" />
        
        {/* Render Pills */}
        {Array.isArray(value) &&
          selectedItems.map((item) => (
            <span
              key={item.id}
              className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
            >
              {item.name}
              <button
                type="button"
                className="ml-2 mt-1 text-blue-600 hover:text-blue-900"
                onClick={(e) => handleRemovePill(e, item.id)}
              >
                <X size={14} />
              </button>
            </span>
          ))}

        <input
          ref={searchInputRef}
          type="text"
          value={
            Array.isArray(value)
              ? searchQuery
              : open
              ? searchQuery
              : singleSelectDisplayName // Shows name immediately if single select
          }
          onChange={handleInputChange}
          onFocus={() => !disabled && setOpen(true)}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && !open) setOpen(true);
          }}
          disabled={disabled}
          placeholder={selectedItems.length > 0 && Array.isArray(value) ? "" : "Select..."}
          className="flex-grow bg-transparent border-white text-gray-700 p-1 outline-none min-w-[100px]"
        />
        <ChevronDown className="h-5 w-5 text-gray-400 ml-auto" />
      </div>

      {open && !disabled && (
        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white z-50 shadow-lg animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-52 overflow-y-auto">
            {loading ? (
              <Loader />
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((item) => {
                const isSelected = Array.isArray(value)
                  ? value.includes(item.id)
                  : value === item.id;
                return (
                  <p
                    key={item.id}
                    className={`px-4 py-2 cursor-pointer text-sm hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    {item.name}
                  </p>
                );
              })
            ) : (
              <p className="px-4 py-2 text-sm text-gray-500">No results found.</p>
            )}
          </div>

          <div
            onClick={() => navigate(cta.path)}
            className="flex items-center px-4 py-3 text-sm text-blue-600 bg-gray-50 cursor-pointer hover:bg-blue-50 border-t transition-colors font-medium"
          >
            {cta.text}
          </div>
        </div>
      )}
    </div>
  );
}