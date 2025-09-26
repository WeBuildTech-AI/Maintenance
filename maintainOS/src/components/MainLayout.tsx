// src/components/MainLayout.tsx
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sidebar } from "./Sidebar";
import { useState } from "react";

interface MainLayoutProps {
  user?: { fullName: string; email: string; avatar?: string };
  onLogout?: () => void;
  children: React.ReactNode; // 👈 modules rendered here
}

export function MainLayout({ user, onLogout, children }: MainLayoutProps) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      {/* <div
        className={`${
          showMobileSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-48 transition-transform lg:translate-x-0 lg:static lg:inset-0`}
      > */}
      <div
        className={`${
          showMobileSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 
        ${expanded ? "w-48" : "w-16"}  // 👈 dynamic width
        transition-all duration-300
        lg:translate-x-0 lg:static lg:inset-0`}
      >
        <Sidebar
          onClose={() => setShowMobileSidebar(false)}
          expanded={expanded}
          setExpanded={setExpanded}
          user={user}
          onLogout={onLogout}
        />
      </div>

      {/* Main content */}
      {/* <div className="flex-1 flex flex-col overflow-hidden"> */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300
        ${expanded ? "ml-16" : "ml-48"} lg:ml-0`} // 👈 shift content
      >
        {/* Mobile menu button */}
        <div className="lg:hidden p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileSidebar(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Routed content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
