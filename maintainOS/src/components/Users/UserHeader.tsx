import type { Dispatch, SetStateAction } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown, Plus, Search, Settings } from "lucide-react";
import { User } from "lucide-react";
import { Users } from "lucide-react";

import { Input } from "../ui/input";
import UserFilterBar from "./UserFilterBar";
import type { ViewMode } from "./types.users";

export function UserHeaderComponent(
  viewMode: ViewMode,
  setViewMode: Dispatch<SetStateAction<ViewMode>>,
  searchQuery: string,
  setSearchQuery: Dispatch<SetStateAction<string>>,
  setIsCreatingForm: Dispatch<SetStateAction<boolean>>,
  setShowSettings: Dispatch<SetStateAction<boolean>>
) {
  return <header className=" border-border bg-card px-6 py-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex item-center gap-6">
          <h1 className="text-2xl font-semibold">Users</h1>
          <div className=" flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {viewMode === "users" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  {viewMode === "teams" ? "Teams" : "Users"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setViewMode("users")}>
                  <User className="mr-2 h-4 w-4" /> Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode("teams")}>
                  <Users className="mr-2 h-4 w-4" /> Teams
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
            placeholder="Search users "
            className="w-[320px] pl-9 bg-white border-orange-600  "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button
          className="gap-2 cursor-pointer bg-orange-600 hover:outline-none"
          onClick={() => {
            setIsCreatingForm(true);
            setViewMode("teams");
          } }
        >
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>
    </div>
    <div className="flex items-center mt-4 p-1 h-10 justify-between">
      {/* Left: Filter bar */}
      <UserFilterBar/>

      {/* Right: Settings button (only for table view) */}
      {viewMode === "users" && (
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