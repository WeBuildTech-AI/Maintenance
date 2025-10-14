import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react"; // 👈 Import new icons
import { Button } from "../../ui/button";
import { MeterCard } from "./MeterCard";
import Loader from "../../Loader/Loader";

// Main component definition
export function MetersList({
  filteredMeters,
  selectedMeter,
  setSelectedMeter,
  loading,
  getAssetData,
  getLocationData,
  handleShowNewMeterForm,
}: any) {
  // --- STATE MANAGEMENT FOR SORTING & DROPDOWN ---
  const [sortType, setSortType] = useState("Last Updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("Name");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // --- REFS FOR DOM ELEMENTS ---
  const headerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // --- SORTING LOGIC ---
  // useMemo ensures we only re-sort when the list or sort criteria change
  const sortedMeters = useMemo(() => {
    const meters = Array.isArray(filteredMeters) ? [...filteredMeters] : [];

    meters.sort((a, b) => {
      let comparison = 0;
      // Determine comparison based on sortType
      switch (sortType) {
        case "Creation Date":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "Last Updated":
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "Name":
        default:
          comparison = a.name.localeCompare(b.name);
          break;
      }
      // Reverse the comparison for descending order
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return meters;
  }, [filteredMeters, sortType, sortOrder]);

  // --- EFFECTS FOR DROPDOWN BEHAVIOR ---
  // Effect to position the dropdown below the header
  useEffect(() => {
    if (isDropdownOpen && headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8, // Position below with 8px margin
        left: rect.left + rect.width / 2, // Center horizontally
      });
    }
  }, [isDropdownOpen]);

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Helper to get the display label for the selected sort option
  const sortLabel = useMemo(() => {
    if (sortType === "Name") {
      return sortOrder === "asc" ? "Ascending Order" : "Descending Order";
    }
    if (sortType === "Creation Date") {
      return sortOrder === "asc" ? "Oldest First" : "Newest First";
    }
    if (sortType === "Last Updated") {
      return sortOrder === "asc" ? "Least Recent First" : "Most Recent First";
    }
    return "";
  }, [sortType, sortOrder]);

  return (
    <div className="w-96 border ml-3 mr-2 border-border bg-card flex flex-col">
      {/* --- Header with Sort Button --- */}
      <div ref={headerRef} className="p-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort By:</span>
          <button
            onClick={() => setIsDropdownOpen((p) => !p)}
            className="flex items-center gap-1 text-sm font-semibold focus:outline-none text-orange-600 p-2 h-auto"
          >
            {sortType}:<p className="font-normal ml-1">{sortLabel}</p>
            {isDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-orange-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-orange-600" />
            )}
          </button>
        </div>
      </div>

      {/* --- Dropdown Modal --- */}
      {isDropdownOpen && (
        <div
          ref={modalRef}
          className="fixed z-50 text-sm rounded-md border border-gray-200 bg-white shadow-lg animate-fade-in p-2"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            transform: "translateX(-50%)",
            width: "300px",
            maxWidth: "90vw",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col divide-y divide-gray-100">
            {[
              {
                label: "Creation Date",
                options: ["Newest First", "Oldest First"],
              },
              {
                label: "Last Updated",
                options: ["Most Recent First", "Least Recent First"],
              },
              {
                label: "Name",
                options: ["Ascending Order", "Descending Order"],
              },
            ].map((section) => (
              <div key={section.label} className="flex flex-col mt-1 mb-1">
                <button
                  onClick={() =>
                    setOpenSection(
                      openSection === section.label ? null : section.label
                    )
                  }
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all rounded-md ${
                    sortType === section.label
                      ? "text-orange-600 font-medium bg-gray-50"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span>{section.label}</span>
                  {openSection === section.label ? (
                    <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>

                {openSection === section.label && (
                  <div className="flex flex-col bg-gray-50 border-t border-gray-100 py-1">
                    {section.options.map((opt) => {
                      const isAsc =
                        opt.includes("Asc") ||
                        opt.includes("Oldest") ||
                        opt.includes("Least");
                      const currentOrder = isAsc ? "asc" : "desc";
                      const isSelected =
                        sortType === section.label &&
                        sortOrder === currentOrder;

                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            setSortType(section.label);
                            setSortOrder(currentOrder);
                            setIsDropdownOpen(false); // Close dropdown on selection
                          }}
                          className={`flex items-center justify-between px-6 py-2 text-left text-sm transition rounded-md ${
                            isSelected
                              ? "text-orange-600 bg-white"
                              : "text-gray-700 hover:text-orange-500 hover:bg-white"
                          }`}
                        >
                          {opt}
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-orange-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- List of Meters --- */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <Loader />
        ) : (
          <div>
            {/* 👇 Use the sortedMeters array here */}
            {sortedMeters?.map((meter: any) => (
              <MeterCard
                key={meter.id}
                meter={meter}
                selectedMeter={selectedMeter}
                setSelectedMeter={setSelectedMeter}
                getAssetData={getAssetData}
                getLocationData={getLocationData}
                handleShowNewMeterForm={handleShowNewMeterForm}
              />
            ))}

            {sortedMeters.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                </div>
                <p className="text-muted-foreground mb-2">
                  Start adding Meters on MaintainOS
                </p>
                <Button
                  variant="link"
                  onClick={() => handleShowNewMeterForm(true)}
                  className="text-primary p-0"
                >
                  Create the first meter
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
