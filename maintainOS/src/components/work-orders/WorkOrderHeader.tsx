import type { Dispatch, SetStateAction } from "react";
import type { ViewMode } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  Calendar,
  ChevronDown,
  LayoutGrid,
  List,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { Input } from "../ui/input";
import WorkOrderFilterBar from "./WorkOrderFilterBar";
import { FetchWorkOrdersParams } from "../../store/workOrders/workOrders.types";

interface WorkOrderHeaderProps {
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setIsCreatingForm: Dispatch<SetStateAction<boolean>>;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  setIsModalOpen?: Dispatch<SetStateAction<boolean>>;
  setIsSettingsModalOpen?: Dispatch<SetStateAction<boolean>>;
  onFilterChange?: (params: FetchWorkOrdersParams) => void;
}

export function WorkOrderHeaderComponent({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  setIsCreatingForm,
  setShowSettings,
  setIsModalOpen,
  setIsSettingsModalOpen,
  onFilterChange,
}: WorkOrderHeaderProps) {
  return (
    <header className=" border-border bg-card px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex item-center gap-6">
            <h1 className="text-2xl font-semibold">Work Orders</h1>
            <div className=" flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    {viewMode === "todo" && (
                      <>
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        To-Do View
                      </>
                    )}
                    {viewMode === "list" && (
                      <>
                        <List className="h-4 w-4 mr-2" />
                        List View
                      </>
                    )}
                    {viewMode === "calendar" && (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Calendar View
                      </>
                    )}
                    {viewMode === "workload" && (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Workload View
                      </>
                    )}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setViewMode("todo")}>
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    To-Do View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode("list")}>
                    <List className="h-4 w-4 mr-2" />
                    List View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode("calendar")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode("workload")}>
                    <Users className="h-4 w-4 mr-2" />
                    Workload View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative border-orange-600 focus:border-orange-600  ">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-600" />
            <Input
              placeholder="Search work orders  "
              className="w-96 pl-9 bg-white border-orange-600  "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="gap-2 cursor-pointer bg-orange-600 hover:outline-none"
            onClick={() => {
              if (viewMode !== "todo") {
                setIsModalOpen?.(true);
              } else {
                setIsCreatingForm(true);
                setViewMode("todo");
              }
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Button>
        </div>
      </div>
      <div className="flex items-center mt-4 p-1 h-10 justify-between">
        {/* Left: Filter bar */}
        <WorkOrderFilterBar onParamsChange={onFilterChange} />

        {/* Right: Settings button (only for table view) */}
        {viewMode === "list" && (
          <button
            onClick={() => setIsSettingsModalOpen?.(true)}
            className="p-2 rounded-md border hover:bg-gray-100 transition"
          >
            <Settings className="h-5 w-5 text-orange-600" />
          </button>
        )}
      </div>
    </header>
  );
}