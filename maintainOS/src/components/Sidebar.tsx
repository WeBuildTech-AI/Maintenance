// src/components/Sidebar.tsx
import {
  ShoppingCart,
  TrendingUp,
  Package,
  MessageSquare,
  Tag,
  Archive,
  BookOpen,
  Gauge,
  Zap,
  MapPin,
  Users,
  Wrench,
  X,
  Settings,
  Handshake,
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  onClose?: () => void;
  user?: { fullName: string; email: string; avatar?: string };
  onLogout?: () => void;
  expanded: boolean;
  setExpanded: (value: boolean) => void;

}

const menuItems = [
  { to: "/work-orders", label: "Work Orders", icon: Wrench },
  { to: "/purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
  { to: "/reporting", label: "Reporting", icon: TrendingUp },
  { to: "/assets", label: "Assets", icon: Package },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/categories", label: "Categories", icon: Tag },
  { to: "/inventory", label: "Parts Inventory", icon: Archive },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/vendors", label: "Vendors", icon: Handshake },
  { to: "/meters", label: "Meters", icon: Gauge },
  { to: "/automations", label: "Automations", icon: Zap },
  { to: "/locations", label: "Locations", icon: MapPin },
  { to: "/team-users", label: "Team & Users", icon: Users },
];

export function Sidebar({
  onClose,
  user,
  onLogout,
  expanded,
  setExpanded,
}: SidebarProps) {

  
  return (
    <div
      className={`h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300
        ${expanded ? "w-50" : "w-16"}`}
    >
      {/* Header */}
      <div className=" border-b border-sidebar-border flex items-center justify-between">
        {expanded ? (
          <div className="p-4">
            <h1 className="text-lg cursor-pointer font-bold text-sidebar-foreground">
              MaintainOS
            </h1>
            {/* <p className="text-sm text-sidebar-foreground/70">Control Center</p> */}
          </div>
        ) : (
          <div className="flex item-center">
            <button
              className="text-lg cursor-pointer p-4 font-bold text-sidebar-foreground"
              onClick={() => setExpanded(true)}
            >
              MS
            </button>
          </div>
        )}

        {expanded ? (
          <Button
            className="mr-2"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        ) : null}
      </div>

      {/* Navigation */}
      {expanded ? (
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`
                  }
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>
      ) : (
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`
                  }
                >
                  <div className="flex text-center justify-center item-center">
                    <Icon className="h-4 w-4 " />
                  </div>
                  {/* {item.label} */}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>
      )}

      {/* User Section */}
      {expanded ? (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.fullName} />
              <AvatarFallback>
                {user?.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate mb-1">
                {user?.fullName || "User"}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto p-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  >
                    <Settings className="h-3 w-3 mr-1 " />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Account Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="text-xs text-sidebar-foreground/60">
            v1.0.0 | Support
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 ">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.fullName} />
              <AvatarFallback>
                {user?.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}
    </div>
  );
}
