import {
  AlertTriangle,
  ChevronDown,
  LayoutGrid,
  PanelTop,
  Plus,
  Search,
  Settings,
  Table,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import POFilterBar from "../../purchase-orders/POFilterBar";

export function AssetsHeader({
  searchQuery,
  setSearchQuery,
  onNewAsset,
  viewMode,
  setViewMode,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onNewAsset: () => void;
}) {
  // const [showSettings, setShowSettings] = useSta(false);
  return (
    <div className="p-6 border-border bg-card flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium">Assets</h1>
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
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button
            className="gap-2 bg-orange-600 hover:bg-orange-700"
            onClick={() => {
              onNewAsset(); // call the function
              setViewMode("panel");
            }}
          >
            <Plus className="h-4 w-4" />
            New Asset
          </Button>
        </div>
      </div>

      {/* <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Criticality
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Filter
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-orange-600">
          <Settings className="h-4 w-4" />
          My Filters
        </Button>
      </div> */}

      <div className="flex items-center justify-between ">
        {/* Left: Filter bar */}
        <POFilterBar />

        {/* Right: Settings button (only for table view) */}
        {/* {viewMode === "table" && (
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-md border hover:bg-gray-100 transition"
          >
            <Settings className="h-5 w-5 text-orange-600" />
          </button>
        )} */}
      </div>
    </div>
  );
}
