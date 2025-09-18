import { useState } from 'react';
import { 
  Home, 
  Package, 
  Wrench, 
  Calendar, 
  Ticket, 
  Users, 
  BarChart3, 
  Settings, 
  FileText, 
  Gauge,
  ShoppingCart,
  Shield,
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from './AuthContext';

interface CMMSSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function CMMSSidebar({ currentView, onViewChange }: CMMSSidebarProps) {
  const { user, logout } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
    { id: 'assets', label: 'Asset Management', icon: Package, badge: null },
    { id: 'workorders', label: 'Work Orders', icon: Wrench, badge: '12' },
    { id: 'preventive', label: 'Preventive Maintenance', icon: Calendar, badge: '3' },
    { id: 'helpdesk', label: 'Helpdesk', icon: Ticket, badge: '5' },
    { id: 'inventory', label: 'Inventory', icon: ShoppingCart, badge: null },
    { id: 'calibration', label: 'Calibration', icon: Gauge, badge: '2' },
    { id: 'logbook', label: 'Digital Logbook', icon: FileText, badge: null },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, badge: null },
    { id: 'users', label: 'User Management', icon: Users, badge: null },
    { id: 'backend-test', label: 'Backend Test', icon: Shield, badge: null },
    { id: 'settings', label: 'System Settings', icon: Settings, badge: null },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-semibold text-lg">CMMS Pro</h1>
            <p className="text-sm text-muted-foreground">Facility Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start text-left h-auto py-3 px-3"
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="w-4 h-4 mr-3" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="ml-2 px-2 py-0 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role} • {user?.department}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}