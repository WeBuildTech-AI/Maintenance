import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import type { ViewMode } from "./po.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  ChevronDown,
  ChevronUp,
  PanelTop,
  Plus,
  Search,
  Settings,
  Table,
} from "lucide-react";
import { Input } from "../ui/input";
import POFilterBar from "./POFilterBar";
import { FetchPurchaseOrdersParams } from "../../store/purchaseOrders/purchaseOrders.types";
import { useNavigate } from "react-router-dom";

// Define the Props Interface
interface POHeaderProps {
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setIsCreatingForm: Dispatch<SetStateAction<boolean>>;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  setIsSettingModalOpen: Dispatch<SetStateAction<boolean>>;
  setShowDeleted: Dispatch<SetStateAction<boolean>>;
  onFilterChange?: (params: FetchPurchaseOrdersParams) => void;
  // ✅ Sorting Props
  sortType: string;
  setSortType: (type: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
}

export function POHeaderComponent({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  setIsCreatingForm,
  setShowSettings,
  setIsSettingModalOpen,
  setShowDeleted,
  onFilterChange,
  sortType,
  setSortType,
  sortOrder,
  setSortOrder,
}: POHeaderProps) {
  const navigate = useNavigate();

  // ✅ Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [openSection, setOpenSection] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="border-border bg-card px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex item-center gap-6">
            <h1 className="text-2xl font-semibold">Purchase Orders</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {viewMode === "panel" ? (
                      <PanelTop className="h-4 w-4" />
                    ) : (
                      <Table className="h-4 w-4" />
                    )}
                    {viewMode === "panel" ? "Panel View" : "Table View"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => {
                      setViewMode("panel");
                      setShowDeleted(false);
                    }}
                  >
                    <PanelTop className="mr-2 h-4 w-4" /> Panel View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setViewMode("table");
                    }}
                  >
                    <Table className="mr-2 h-4 w-4" /> Table View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative border-orange-600 focus:border-orange-600">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-600" />
            <Input
              placeholder="Search purchase orders"
              className="w-96 pl-9 bg-white border-orange-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="gap-2 cursor-pointer bg-orange-600 hover:outline-none"
            onClick={() => {
              setIsCreatingForm(true);
              setViewMode("panel");
              navigate("/purchase-orders/create");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Order
          </Button>
        </div>
      </div>

      <div className="flex items-center mt-4 p-1 h-10 justify-between">
        {/* Left: Filter bar */}
        <POFilterBar onParamsChange={onFilterChange} />

        <div className="flex items-center gap-4">
          {/* ✅ Sort Trigger Button (Matches your image) */}

          {/* Settings button (only for table view) */}
          {viewMode === "table" && (
            <button
              onClick={() => setIsSettingModalOpen(true)}
              className="p-2 rounded-md border hover:bg-gray-100 transition"
            >
              <Settings className="h-5 w-5 text-orange-600" />
            </button>
          )}
        </div>
      </div>

      {/* ✅ Sort Dropdown (Your exact snippet restored) */}
      {isDropdownOpen && (
        <div
          ref={modalRef}
          className="fixed z-[9999] text-sm rounded-lg border border-gray-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100 p-1"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            transform: "translateX(-50%)",
            width: "240px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            {[
              {
                label: "Creation Date",
                options: ["Oldest First", "Newest First"],
              },
              {
                label: "Last Updated",
                options: ["Least Recent First", "Most Recent First"],
              },
              {
                label: "Name",
                options: ["Ascending Order", "Descending Order"],
              },
            ].map((section) => (
              <div key={section.label}>
                <button
                  onClick={() =>
                    setOpenSection(
                      openSection === section.label ? null : section.label
                    )
                  }
                  className={`flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-100 rounded-md ${
                    sortType === section.label
                      ? "bg-orange-50 text-orange-700"
                      : ""
                  }`}
                >
                  <span>{section.label}</span>
                  {openSection === section.label ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
                {openSection === section.label && (
                  <div className="pl-4 pr-2 bg-gray-50 py-1 space-y-1">
                    {section.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSortType(section.label);
                          setSortOrder(
                            opt.includes("Asc") ||
                              opt.includes("Oldest") ||
                              opt.includes("Least")
                              ? "asc"
                              : "desc"
                          );
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left text-xs px-2 py-1.5 hover:bg-white rounded text-gray-600"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}