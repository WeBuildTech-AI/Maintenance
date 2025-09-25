import { Search, Plus, LayoutGrid, ChevronDown, Zap, Building2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

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
}: any) {
  return (
    <div className="p-6 border-b border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium">Meters</h1>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Panel View</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
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

      <div className="flex items-center gap-1">
        <Button
          variant={selectedType === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedType("all")}
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          Type
        </Button>
        <Button
          variant={selectedAsset === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedAsset("all")}
          className="gap-2"
        >
          <Building2 className="h-4 w-4" />
          Asset
        </Button>
        <Button
          variant={selectedLocation === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedLocation("all")}
          className="gap-2"
        >
          📍 Location
        </Button>
      </div>
    </div>
  );
}
