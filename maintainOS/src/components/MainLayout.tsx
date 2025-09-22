import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sidebar } from "./Sidebar";
import { useState } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  currentModule: string;
  onModuleChange: (module: string) => void;
  user?: { name: string; email: string; avatar?: string };
  onLogout?: () => void;
}

export function MainLayout({ children, currentModule, onModuleChange, user, onLogout }: MainLayoutProps) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
      <div className={`${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 transition-transform lg:translate-x-0 lg:static lg:inset-0`}>
        <Sidebar 
          currentModule={currentModule} 
          onModuleChange={onModuleChange}
          onClose={() => setShowMobileSidebar(false)}
          user={user}
          onLogout={onLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile menu button - only visible on mobile when sidebar is hidden */}
        <div className="lg:hidden p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileSidebar(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}