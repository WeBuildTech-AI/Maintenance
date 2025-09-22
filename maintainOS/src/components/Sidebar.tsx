import { 
  BarChart3, 
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
  Handshake
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "./ui/dropdown-menu";

interface SidebarProps {
  currentModule: string;
  onModuleChange: (module: string) => void;
  onClose?: () => void;
  user?: { name: string; email: string; avatar?: string };
  onLogout?: () => void;
}

const menuItems = [
  { id: "work-orders", label: "Work Orders", icon: Wrench },
  { id: "purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
  { id: "reporting", label: "Reporting", icon: TrendingUp },
  { id: "assets", label: "Assets", icon: Package },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "inventory", label: "Parts Inventory", icon: Archive },
  { id: "library", label: "Library", icon: BookOpen },
  { id: "vendors", label: "Vendors", icon: Handshake },
  { id: "meters", label: "Meters", icon: Gauge },
  { id: "automations", label: "Automations", icon: Zap },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "team-users", label: "Team & Users", icon: Users },
];

export function Sidebar({ currentModule, onModuleChange, onClose, user, onLogout }: SidebarProps) {
  return (
    <div className="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sidebar-foreground">MaintainOS</h1>
          <p className="text-sm text-sidebar-foreground/70">Control Center</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start text-left ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                onClick={() => {
                  onModuleChange(item.id);
                  onClose?.();
                }}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate mb-1">
              {user?.name || 'User'}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-0 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground">
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Account Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="text-xs text-sidebar-foreground/60">
          v1.0.0 | Support
        </div>
      </div>
    </div>
  );
}
