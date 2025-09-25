import {
  Search,
  Plus,
  LayoutGrid,
  ChevronDown,
  Zap,
  Building2,
  PanelTop,
  Table,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";

export function MetersHeader({
  searchQuery,
  setSearchQuery,
  setShowNewMeterForm,
  selectedType,
  setSelectedType,
  selectedAsset,
  setSelectedAsset,
  selectedLocation,
  setSelectedLocation,
  viewMode,
  setViewMode,
}: any) {
  return (
    <div className="p-6 border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium">Meters</h1>
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
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search Meters"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button
            className="gap-2 bg-orange-600 hover:bg-orange-700"
            onClick={() => setShowNewMeterForm(true)}
          >
            <Plus className="h-4 w-4" />
            New Meter
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={selectedType === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedType("all")}
          className="gap-2 text-orange-600 bg-white hover:bg-orange-50 cursor-pointer border border-orange-600"
        >
          <Zap className="h-4 w-4" />
          Type
        </Button>
        <Button
          variant={selectedAsset === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedAsset("all")}
          className="gap-2 text-orange-600 bg-white hover:bg-orange-50 cursor-pointer border border-orange-600"
        >
          <Building2 className="h-4 w-4" />
          Asset
        </Button>
        <Button
          variant={selectedLocation === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedLocation("all")}
          className="gap-2 text-orange-600  hover:bg-orange-50 cursor-pointer bg-white border border-orange-600"
        >
          📍 Location
        </Button>
      </div>
    </div>
  );
}
