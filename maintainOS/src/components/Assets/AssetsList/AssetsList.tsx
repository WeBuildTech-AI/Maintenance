import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { Button } from "../../ui/button";
import { AssetCard } from "./AssetCard";
import Loader from "../../Loader/Loader";
import type { Asset } from "../Assets"; // Import the Asset type

// Define props for the component
interface AssetsListProps {
  assets: Asset[]; // Use the strong type
  selectedAsset: Asset | null; // Use the strong type
  setSelectedAsset: (asset: Asset) => void;
  setShowNewAssetForm: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  // Props for sorting, passed from parent
  sortType: string;
  setSortType: (type: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  allLocationData: { name: string }[]; // Use the strong type

  currentPage: number;
  setCurrentPage: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function AssetsList({
  assets,
  selectedAsset,
  setSelectedAsset,
  setShowNewAssetForm,
  loading,
  sortType,
  setSortType,
  sortOrder,
  setSortOrder,
  allLocationData,
  currentPage,
  setCurrentPage,
  startIndex,
  endIndex,
  totalItems,
}: AssetsListProps) {
  // --- State and Refs for the custom dropdown ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(sortType);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Effect to position the dropdown below the button
  useEffect(() => {
    if (isDropdownOpen && headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [isDropdownOpen]);

  const sortLabel = useMemo(() => {
    switch (sortType) {
      case "Last Updated":
        return sortOrder === "desc"
          ? "Most Recent First"
          : "Least Recent First";
      case "Creation Date":
        return sortOrder === "desc" ? "Newest First" : "Oldest First";
      case "Name":
        return sortOrder === "asc" ? "Ascending Order" : "Descending Order";
      default:
        return "Sort By"; // Fallback text
    }
  }, [sortType, sortOrder]);

  // Effect to close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-96 border ml-2 mr-3 mb-2 border-border bg-card flex flex-col min-h-0">
      {/* --- Custom Dropdown Header --- */}
      <div ref={headerRef} className="p-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort By:</span>
          <button
            onClick={() => setIsDropdownOpen((p) => !p)}
            className="flex items-center gap-1 text-sm font-semibold focus:outline-none text-orange-600 p-2 h-auto"
          >
            {sortType}:<p>{sortLabel}</p>
            {isDropdownOpen ? (
              <ChevronUp className="w-4 h-4 mt-1 text-orange-600" />
            ) : (
              <ChevronDown className="w-4 h-4 mt-1 text-orange-600" />
            )}
          </button>
        </div>
      </div>

      {/* --- Dropdown Modal --- */}
      {isDropdownOpen && (
        <div
          ref={modalRef}
          className="fixed z-[99] text-sm rounded-md border border-gray-200 bg-white shadow-lg animate-fade-in p-2"
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
                              : "text-gray-700 hover:text-blue-300 hover:bg-white"
                          }`}
                        >
                          {opt}
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-blue-300" />
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

      {/* --- Assets List Content --- */}
      {loading ? (
        <Loader />
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 p-4">
          <div className="">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                selected={selectedAsset?.id === asset.id}
                onSelect={() => setSelectedAsset(asset)}
                setShowNewAssetForm={setShowNewAssetForm}
                allLocationData={allLocationData}
              />
            ))}

            {assets.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                </div>
                <p className="text-muted-foreground mb-2">
                  Start adding Asset on MaintainOS
                </p>
                <Button
                  onClick={() => setShowNewAssetForm(true)}
                  variant="link"
                  className="text-primary p-0 cursor-pointer"
                >
                  Create the first asset
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* pagination */}
      {totalItems > 0 && (
        <div className="flex justify-end p-3 border-t bg-white">
          <div className="flex items-center gap-3 border border-yellow-400 rounded-full px-3 py-1">
            <span className="text-xs">
              {startIndex + 1} – {endIndex} of {totalItems}
            </span>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              disabled={endIndex >= totalItems}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
