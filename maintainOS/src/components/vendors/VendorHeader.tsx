import type { Dispatch, SetStateAction } from "react";
import type { ViewMode } from "../purchase-orders/po.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown, PanelTop, Plus, Search, Settings, Table } from "lucide-react";
import { Input } from "../ui/input";
import VendorFilterBar from "./VendorFilterBar";

export function HeaderComponent(
  viewMode: ViewMode,
  setViewMode: Dispatch<SetStateAction<ViewMode>>,
  searchQuery: string,
  setSearchQuery: Dispatch<SetStateAction<string>>,
  setIsCreatingVendor: Dispatch<SetStateAction<boolean>>,
  setShowSettings: Dispatch<SetStateAction<boolean>>
) {
  return <header className=" border-border bg-card px-6 py-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex item-center gap-6">
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
        <div className="relative border-orange-600 focus:border-orange-600  ">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-600" />
          <Input
            placeholder="Search vendors "
            className="w-[320px] pl-9 bg-white border-orange-600  "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button
          className="gap-2 cursor-pointer bg-orange-600 hover:outline-none"
          onClick={() => {
            setIsCreatingVendor(true);
            setViewMode("panel");
          } }
        >
          <Plus className="mr-2 h-4 w-4" />
          New Vendor
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
    <div className="flex items-center mt-4 p-1 h-10 justify-between">
      {/* Left: Filter bar */}
      <VendorFilterBar />

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
  </header>;
}