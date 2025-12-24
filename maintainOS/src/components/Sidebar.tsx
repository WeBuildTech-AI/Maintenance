// src/components/Sidebar.tsx
import { useEffect, useState } from "react";
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
  LogOut,
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
import { jwtDecode } from "jwt-decode"; // Import the decoder

// 1. Define the Token Interface based on your JSON
interface UserToken {
  sub: string;
  email: string;
  orgId: string;
  orgName: string;
  fullName: string;
  role: string;
  iat: number;
  exp: number;
}

// 2. Update SidebarProps to include the specific user shape
interface SidebarProps {
  onClose?: () => void;
  // We can make user optional and derive it internally,
  // or pass it in. For this example, we accept it or default to null.
  user?: UserToken | null;
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
  { to: "/meters", label: "Meters", icon: Gauge },
  { to: "/automations", label: "Automations", icon: Zap },
  { to: "/locations", label: "Locations", icon: MapPin },
  { to: "/users", label: "Team & Users", icon: Users },
  { to: "/vendors", label: "Vendors", icon: Handshake },
];

export function Sidebar({
  onClose,
  onLogout,
  expanded,
  setExpanded,
  // If user is passed as prop, use it. Otherwise, we can decode it here.
  user: propUser,
}: SidebarProps) {
  const [currentUser, setCurrentUser] = useState<UserToken | null>(
    propUser || null
  );

  // 3. Logic to decode token on mount (if user prop isn't provided)
  useEffect(() => {
    if (propUser) return; // If parent passed user, use that

    const token = localStorage.getItem("token"); // Replace "token" with your actual key
    if (token) {
      try {
        const decoded = jwtDecode<UserToken>(token);
        setCurrentUser(decoded);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, [propUser]);

  // Generate initials for Avatar
  const initials = currentUser?.fullName
    ? currentUser.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const formatOrgName = (name: string, maxLength = 12) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + "…";
  };

  return (
    <div
      className={`h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300
        ${expanded ? "w-64" : "w-16"}`}
    >
      {/* Header */}
      <div className="border-b border-sidebar-border flex items-center justify-between">
        {expanded ? (
          <div className="flex gap-2 p-4">
            <img src="/Vector.svg" alt="MaintainOS" className="h-8 w-auto" />
            <div className="inline-flex items-center bg-brand-yellow border border-brand-black rounded px-2 py-1">
              <span className="font-bold text-brand-black">MaintainOS</span>
            </div>
          </div>
        ) : (
          <div className="flex item-center">
            <button
              className="text-lg cursor-pointer p-4 font-bold text-sidebar-foreground"
              onClick={() => setExpanded(true)}
            >
              <img src="/Vector.svg" alt="MaintainOS" className="h-8 w-auto" />
            </button>
          </div>
        )}

        {expanded && (
          <Button
            className="mr-2"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
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
                  `flex items-center ${
                    expanded ? "px-3" : "px-2 justify-center"
                  } py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`
                }
              >
                <Icon className={`${expanded ? "mr-3" : ""} h-5 w-5`} />
                {expanded && item.label}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Section - Updated to show Email and Role */}
      <div className="border-t border-sidebar-border p-3">
        {expanded ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              {/* If you have an avatar URL in the token, use it here, otherwise fallback */}
              <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {currentUser?.fullName || "Guest User"}
              </p>
              {/* Showing Email */}
              <p
                className="text-xs text-muted-foreground truncate"
                title={currentUser?.email}
              >
                {currentUser?.email}
              </p>
              {/* Showing Role Badge */}
              {currentUser?.role && currentUser?.orgName && (
                <div className="mt-1 flex items-center">
                  <span
                    title={currentUser.orgName} // hover shows full name
                    className="
        inline-flex items-center
        max-w-[140px]
        truncate
        px-2 py-0.5
        text-xs uppercase font-semibold tracking-wide
        rounded-md
        bg-primary/10 text-primary
      "
                  >
                    {formatOrgName(currentUser.orgName)}
                  </span>
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-48">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar
              className="h-8 w-8 cursor-pointer"
              onClick={() => setExpanded(true)}
            >
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );
}
