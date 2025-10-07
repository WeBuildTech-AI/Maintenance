"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { vendorService } from "../../../store/vendors";
import { locationService } from "../../../store/locations";
import Loader from "../../Loader/Loader";
import { teamService } from "../../../store/teams";

type Stage = "teams" | "vendors" | "parent";

type DropdownsProps = {
  stage: Stage;
  open: boolean;
  setOpen: (v: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  navigate: (path: string) => void;
  value: string | string[]; // ID(s)
  onSelect: (val: string | string[]) => void; // pass ID(s)
};

export function Dropdowns({
  stage,
  open,
  setOpen,
  containerRef,
  navigate,
  value,
  onSelect,
}: DropdownsProps) {
  const hasFetched = useRef(false);
  const [loading, setLoading] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState<
    { id: string; name: string }[]
  >([]);

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

  const handleFetchApi = async () => {
    setLoading(true);
    try {
      if (stage === "vendors") {
        const res = await vendorService.fetchVendorName(10, 1, 0);
        setDynamicOptions(res.data);
      } else if (stage === "teams") {
        const res = await teamService.fetchTeamsName(10, 1, 0);
        setDynamicOptions(res.data);
      } else {
        const res = await locationService.fetchLocationsName(10, 1, 0);
        setDynamicOptions(res.data);
      }
    } catch (err) {
      console.error("Dropdown fetch error:", err);
      setDynamicOptions([]); // clear options if error
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (id: string) => {
    if (Array.isArray(value)) {
      if (value.includes(id)) {
        onSelect(value.filter((v) => v !== id));
      } else {
        onSelect([...value, id]);
      }
    } else {
      onSelect(id);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <h3 className="mb-2 text-base font-medium text-gray-900">{label}</h3>

      {/* Input / Selected values */}
      <div
        className="flex flex-wrap items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 h-auto min-h-[48px] cursor-pointer"
        onClick={() => {
          const nextState = !open;
          setOpen(nextState);
          if (nextState) {
            handleFetchApi(); // only fetch when opening
          }
        }}
      >
        <Search className="h-8 w-4 text-gray-400 mr-1" />
        {Array.isArray(value) && value.length > 0 ? (
          value.map((id) => {
            const item = dynamicOptions.find((opt) => opt.id === id);
            if (!item) return null;
            return (
              <span
                key={id}
                className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                {item.name}
                <button
                  type="button"
                  className="ml-1 text-blue-600 hover:text-blue-900"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent dropdown toggle
                    onSelect(value.filter((v) => v !== id));
                  }}
                >
                  ×
                </button>
              </span>
            );
          })
        ) : typeof value === "string" && value ? (
          <span className="text-gray-700">
            {dynamicOptions.find((opt) => opt.id === value)?.name || value}
          </span>
        ) : (
          <span className="text-gray-400">Select...</span>
        )}
        <ChevronDown className="h-5 w-5 text-gray-400 ml-auto" />
      </div>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute max-h-32 left-0 top-full mt-1 w-full rounded-md border bg-white z-50 max-h-60 overflow-y-auto shadow-lg">
          {loading ? (
            <Loader />
          ) : (
            dynamicOptions.map((item) => {
              const isSelected = Array.isArray(value)
                ? value.includes(item.id)
                : value === item.id;
              return (
                <p
                  key={item.id}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    isSelected ? "bg-gray-200" : ""
                  }`}
                  onClick={() => {
                    toggleOption(item.id);
                    setOpen(false);
                  }}
                >
                  {item.name}
                </p>
              );
            })
          )}

          {/* CTA */}
          <div
            onClick={() => navigate(cta.path)}
            className="relative flex items-center px-4 py-2 rounded-md text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-l-md" />
            <span className="ml-3">{cta.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
