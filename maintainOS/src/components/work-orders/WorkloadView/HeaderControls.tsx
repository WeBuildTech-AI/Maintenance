import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

type SortOption = "name-asc" | "utilization-desc" | "utilization-asc";

interface HeaderControlsProps {
  weekRangeLabel: string;
  weekOffset: number;
  setWeekOffset: (fn: (prev: number) => number) => void;
  teamFilter: string;
  setTeamFilter: (val: string) => void;
  sortOption: SortOption;
  setSortOption: (val: SortOption) => void;
  availableTeams: string[];
}

export function HeaderControls({
  weekRangeLabel,
  weekOffset,
  setWeekOffset,
  teamFilter,
  setTeamFilter,
  sortOption,
  setSortOption,
  availableTeams,
}: HeaderControlsProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Top Section - Users Icon + Date Range + This Week Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Users</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Date Range with Navigation */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setWeekOffset((p) => p - 1)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">{weekRangeLabel}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setWeekOffset((p) => p + 1)}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant={weekOffset === 0 ? "default" : "outline"} 
            size="sm" 
            onClick={() => setWeekOffset(0)}
            className="text-sm"
          >
            This Week
          </Button>
        </div>
      </div>

      {/* Bottom Section - Filters */}
      <div className="flex items-center gap-3">
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {availableTeams.map((team) => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A–Z)</SelectItem>
            <SelectItem value="utilization-desc">Utilization (High → Low)</SelectItem>
            <SelectItem value="utilization-asc">Utilization (Low → High)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}