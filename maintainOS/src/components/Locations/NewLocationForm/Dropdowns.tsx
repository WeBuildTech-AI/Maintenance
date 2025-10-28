"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react"; // <-- Change: useMemo import kiya
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
}: DropdownsProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // <-- Change: Yeh state saare options ko store karega
  const [allOptions, setAllOptions] = useState<Option[]>([]);

  // <-- Change: Yeh state sirf ek baar fetch karne ke liye track rakhega
  const [hasFetched, setHasFetched] = useState(false);

  const [selectedItems, setSelectedItems] = useState<Option[]>([]);

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

  // <-- Change: Yeh effect sirf ek baar saara data fetch karega
  useEffect(() => {
    // Dropdown khulne par aur agar data pehle se fetch nahi hua hai tabhi call karein
    if (open && !hasFetched) {
      setLoading(true);
      const fetchAllData = async () => {
        try {
          // Note: Yahan service se saara data (bina limit ke) fetch karna hoga.
          // Ho sakta hai aapko service method update karna pade.
          let res;
          if (stage === "vendors") {
            res = await vendorService.fetchVendorName(); // Example: fetching up to 1000 items
          } else if (stage === "teams") {
            res = await teamService.fetchTeamsName();
          } else {
            res = await locationService.fetchLocationsName();
          }
          setAllOptions(res); // Saara data state mein save karein
          setHasFetched(true); // Mark karein ki data fetch ho gaya hai
        } catch (err) {
          console.error("Dropdown fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchAllData();
    }
  }, [open, hasFetched, stage]);

  // <-- Change: Yeh function ab local state (allOptions) se data filter karega
  const filteredOptions = useMemo(() => {
    if (!searchQuery) {
      return allOptions; // Agar search khali hai, to sab options dikhayein
    }
    return allOptions.filter((option) =>
      option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allOptions]);

  // Effect to manage selected items based on value prop (No changes here)
  useEffect(() => {
    const valueAsArray = Array.isArray(value) ? value : value ? [value] : [];
    if (valueAsArray.length > 0) {
      const selected = allOptions.filter((opt) =>
        valueAsArray.includes(opt.id)
      );
      // Only update if the selected items are different
      if (selected.length > 0 && selected.length !== selectedItems.length) {
        setSelectedItems(selected);
      }
    } else {
      setSelectedItems([]);
    }
  }, [value, allOptions]);

  const handleSelect = (option: Option) => {
    // ... (No changes in this function)
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

  // ... (Rest of the component logic remains the same)
  // Just make sure to use `filteredOptions` in your JSX to render the list.

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

  const handleInputFocus = () => {
    setOpen(true);
    if (typeof value === "string" && value) {
      setSearchQuery("");
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open) setOpen(true);
  };

  const singleSelectDisplayName = selectedItems[0]?.name || "";

  return (
    <div className="relative" ref={containerRef}>
      <h3 className="mb-2 text-base font-medium text-gray-900">{label}</h3>
      <div
        className="flex flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1 h-auto min-h-[48px] cursor-text"
        onClick={() => searchInputRef.current?.focus()}
      >
        <Search className="h-5 w-5 text-gray-400" />
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
              : singleSelectDisplayName
          }
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          placeholder="Select..."
          // highlight-next-line
          className="flex-grow bg-transparent border-white text-gray-700 p-1 outline-none"
          style={{ minWidth: "100px" }}
        />
        <ChevronDown className="h-5 w-5 text-gray-400 ml-auto" />
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white z-50 shadow-lg">
          <div className="max-h-32 overflow-y-auto">
            {loading ? (
              <Loader />
            ) : // <-- Change: Yahan `filteredOptions` ka use karein
            filteredOptions.length > 0 ? (
              filteredOptions.map((item) => {
                const isSelected = Array.isArray(value)
                  ? value.includes(item.id)
                  : value === item.id;
                return (
                  <p
                    key={item.id}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      isSelected ? " text-blue-700 font-semibold " : ""
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    {item.name}
                  </p>
                );
              })
            ) : (
              <p className="px-4 py-2 text-gray-500">No results found.</p>
            )}
          </div>

          <div
            onClick={() => navigate(cta.path)}
            className="relative flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100 border-t"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
            <span className="ml-3">{cta.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
