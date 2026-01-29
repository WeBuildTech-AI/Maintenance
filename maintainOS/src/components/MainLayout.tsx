import { createContext, useContext } from "react"; 
import { TopHeader } from "./TopHeader";

interface MainLayoutProps {
  user?: { fullName: string; email: string; avatar?: string };
  onLogout?: () => void;
  children: React.ReactNode;
}

interface ILayoutContext {
  isSidebarExpanded: boolean;
  sidebarWidth: number;
}

// Keep context for compatibility, but with static values
const LayoutContext = createContext<ILayoutContext>({
  isSidebarExpanded: false,
  sidebarWidth: 0,
});

export const useLayout = () => useContext(LayoutContext);

export function MainLayout({ user, onLogout, children }: MainLayoutProps) {
  // Sidebar state removed as it is no longer needed

  return (
    <LayoutContext.Provider
      value={{
        isSidebarExpanded: false,
        sidebarWidth: 0,
      }}
    >
      <div className="flex flex-col h-screen bg-background">
        <TopHeader user={user} onLogout={onLogout} />

        {/* Main content */}
        <main className="flex-1 overflow-auto">
            {children}
        </main>
      </div>
    </LayoutContext.Provider>
  );
}
