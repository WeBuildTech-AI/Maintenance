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
  Settings,
  Handshake,
  ChevronDown,
  Bell,
  LogOut,
  User,
  LayoutGrid,
  Calendar,
  List
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useLocation, NavLink, Link } from "react-router-dom";
import { Button } from "./ui/button";

interface TopHeaderProps {
  user?: { fullName: string; email: string; avatar?: string };
  onLogout?: () => void;
}

// ... existing imports

// ... existing interfaces

const defaultModule = { to: "/work-orders", label: "Work Orders", icon: Wrench, id: "nav-link-workorders" };
const reportingModule = { to: "/reporting", label: "Reporting", icon: TrendingUp, id: "nav-link-reporting" };

const secondaryLinks = [
  { to: "/work-orders", label: "Work Orders", icon: Wrench, id: "nav-item-work-orders" },
  { to: "/assets", label: "Assets", icon: Package, id: "nav-item-assets" },
  { to: "/purchase-orders", label: "Purchase Orders", icon: ShoppingCart, id: "nav-item-purchase-orders" },
  { to: "/messages", label: "Messages", icon: MessageSquare, id: "nav-item-messages" },
  { to: "/categories", label: "Categories", icon: Tag, id: "nav-item-categories" },
  { to: "/inventory", label: "Inventory", icon: Archive, id: "nav-item-inventory" },
  { to: "/library", label: "Library", icon: BookOpen, id: "nav-item-library" },
  { to: "/meters", label: "Meters", icon: Gauge, id: "nav-item-meters" },
  { to: "/automations", label: "Automations", icon: Zap, id: "nav-item-automations" },
  { to: "/locations", label: "Location", icon: MapPin, id: "nav-item-locations" },
  { to: "/users", label: "Team & Users", icon: Users, id: "nav-item-users" },
  { to: "/vendors", label: "Vendors", icon: Handshake, id: "nav-item-vendors" },
];

export function TopHeader({ user, onLogout }: TopHeaderProps) {
  const imageSrc = user?.avatar ? user.avatar : "/default-avatar.png";
  const location = useLocation();
  const currentPath = location.pathname;

  // Find if current path matches any secondary link
  const activeSecondary = secondaryLinks.find(link => currentPath.startsWith(link.to));

  // The first link is either the active secondary module or the default "Workorder"
  const dynamicModule = activeSecondary || defaultModule;

  return (
    <header className="top-header-container" id="top-header">
      {/* Left Section: Logo */}
      <div className="header-left-section" id="header-left-section">
        {/* Logo */}
        <Link to="/" className="header-logo-link" id="header-logo-link">
          <img src="/maintainOSLOGO.svg" alt="MaintainOS" className="h-6 w-auto" id="header-logo-image" />
          <span className="header-logo-text" id="header-logo-text">MaintainOS</span>
        </Link>
      </div>

      {/* Center Section: Navigation */}
      {/* Center Section: Navigation */}
      <div className="header-center-section" id="header-center-section">
        {/* Navigation - Primary Links */}
        <nav className="header-nav" id="header-nav">
          {/* Dynamic Module Link */}
          <NavLink
            to={dynamicModule.to}
            id={dynamicModule.id}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            {dynamicModule.label}
          </NavLink>

          {/* Reporting Link (Fixed) */}
          <NavLink
            to={reportingModule.to}
            id={reportingModule.id}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            {reportingModule.label}
          </NavLink>

          {/* More Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="more-dropdown-btn" id="nav-dropdown-more-trigger">
                Menu <ChevronDown size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="more-dropdown-content" id="nav-dropdown-more-content">
              {secondaryLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPath.startsWith(link.to);
                return (
                  <DropdownMenuItem asChild key={link.to}>
                    <Link
                      to={link.to}
                      id={link.id}
                      className={`dropdown-nav-link ${isActive ? "active" : ""}`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{link.label}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Dropdown (Only visible on Work Orders) */}
          {currentPath.startsWith("/work-orders") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="more-dropdown-btn" id="nav-dropdown-view-trigger">
                  {location.search.includes("view=calendar")
                    ? "Calendar View"
                    : location.search.includes("view=list")
                      ? "List View"
                      : "Panel View"}
                  <ChevronDown size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="more-dropdown-content"
                id="nav-dropdown-view-content"
                style={{ width: "180px" }}
              >
                <DropdownMenuItem asChild>
                  <Link
                    to="/work-orders?view=todo"
                    className={`dropdown-nav-link ${location.search.includes("view=todo") ||
                      !location.search.includes("view=")
                      ? "active"
                      : ""
                      }`}
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span>Panel View</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/work-orders?view=calendar-week"
                    className={`dropdown-nav-link ${location.search.includes("view=calendar") ? "active" : ""
                      }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Calendar View</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/work-orders?view=list"
                    className={`dropdown-nav-link ${location.search.includes("view=list") ? "active" : ""
                      }`}
                  >
                    <List className="mr-2 h-4 w-4" />
                    <span>List View</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>

      {/* Right Section: Icons & User Profile */}
      <div className="header-right-section" id="header-right-section">
        <button className="header-icon-btn" id="header-icon-notifications">
          <Bell size={20} color="#6b7280" strokeWidth={2} />
        </button>
        <button className="header-icon-btn" id="header-icon-messages">
          <MessageSquare size={20} color="#6b7280" strokeWidth={2} />
        </button>
        <button className="header-icon-btn" id="header-icon-settings">
          <Settings size={20} color="#6b7280" strokeWidth={2} />
        </button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" id="user-profile-trigger">
              <Avatar className="h-8 w-8">
                <AvatarImage src={imageSrc} alt={user?.fullName} />
                <AvatarFallback>
                  {user?.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" id="user-profile-content">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium" id="user-profile-name">{user?.fullName || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground" id="user-profile-email">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem id="user-menu-profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem id="user-menu-settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} id="user-menu-logout">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
