import { useMemo, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Search,
  Plus,
  Settings,
  PanelTop,
  Table,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { VendorSidebar } from "./VendorSidebar";
import { VendorDetails } from "./VendorDetails";
import { VendorTable } from "./VendorTable";
import { VendorForm } from "./VendorForm";
import { mockVendors, type Vendor } from "./vendors.types";
import POFilterBar from "../purchase-orders/POFilterBar";
import SettingsModal from "../purchase-orders/SettingsModal";

type ViewMode = "panel" | "table";

export function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState(
    mockVendors[0]?.id ?? ""
  );
  const [isCreatingVendor, setIsCreatingVendor] = useState(false);

  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendors;
    const query = searchQuery.toLowerCase();
    return vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(query) ||
        vendor.category.toLowerCase().includes(query) ||
        vendor.services.some((s) => s.toLowerCase().includes(query))
    );
  }, [vendors, searchQuery]);

  useEffect(() => {
    if (filteredVendors.length === 0) return;
    if (!filteredVendors.some((v) => v.id === selectedVendorId)) {
      setSelectedVendorId(filteredVendors[0].id);
    }
  }, [filteredVendors, selectedVendorId]);

  const selectedVendor =
    filteredVendors.find((v) => v.id === selectedVendorId) ??
    filteredVendors[0];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className=" border-border bg-card px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex item-center mt-4 gap-6">
              <h1 className="text-2xl font-semibold">Vendors</h1>
              <div className=" flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
                    <DropdownMenuItem onClick={() => setViewMode("panel")}>
                      <PanelTop className="mr-2 h-4 w-4" /> Panel View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode("table")}>
                      <Table className="mr-2 h-4 w-4" /> Table View
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <p className="text-sm mt-2 text-muted-foreground">
              Manage vendor relationships, contacts, and service coverage
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vendors"
                className="w-[320px] pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className="cursor-pointer"
              onClick={() => setIsCreatingVendor(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Vendor
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center mt-4 justify-between mb-4">
          {/* Left: Filter bar */}
          <POFilterBar />

          {/* Right: Settings button (only for table view) */}
          {viewMode === "table" && (
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-md border hover:bg-gray-100 transition"
            >
              <Settings className="h-5 w-5 text-orange-600" />
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden bg-muted/20">
        {viewMode === "panel" ? (
          <>
            <VendorSidebar
              vendors={filteredVendors}
              selectedVendorId={selectedVendorId}
              setSelectedVendorId={setSelectedVendorId}
              setIsCreatingVendor={setIsCreatingVendor}
            />
            <section className="flex-1 overflow-auto ml-2 mr-3">
              {isCreatingVendor ? (
                <VendorForm
                  setVendors={setVendors}
                  setSelectedVendorId={setSelectedVendorId}
                  onCancel={() => setIsCreatingVendor(false)}
                />
              ) : selectedVendor ? (
                <VendorDetails
                  vendor={selectedVendor}
                  setVendors={setVendors}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Select a vendor to view details.
                </div>
              )}
            </section>
          </>
        ) : (
          <VendorTable
            vendors={filteredVendors}
            selectedVendorId={selectedVendorId}
          />
        )}
      </div>
      {/* {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />} */}
    </div>
  );
}
