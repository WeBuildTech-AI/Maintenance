import { AlertTriangle, ChevronDown, LayoutGrid, Plus, Search, Settings } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

export function AssetsHeader({
  searchQuery,
  setSearchQuery,
  onNewAsset,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onNewAsset: () => void;
}) {
  return (
    <div className="p-6 border-b border-border bg-card flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium">Assets</h1>
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
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button className="gap-2 bg-orange-600 hover:bg-orange-700" onClick={onNewAsset}>
            <Plus className="h-4 w-4" />
            New Asset
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
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
      </div>
    </div>
  );
}
