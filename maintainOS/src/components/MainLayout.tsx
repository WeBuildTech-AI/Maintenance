import { Menu } from "lucide-react";
// UPDATE: Import path ko fix kiya
import { Button } from "./ui/button"; 
import { Sidebar } from "./Sidebar";
// ADD: React Context ke liye 'createContext' aur 'useContext' ko import kiya
import { createContext, use, useContext, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import {logout} from "../store/auth/auth.thunks";
import { type AppDispatch } from "../store";
import { useDispatch } from "react-redux";

interface MainLayoutProps {
  user?: { fullName: string; email: string; avatar?: string };
  onLogout?: () => void;
  children: React.ReactNode;
}

// ADD: Context ke data type ke liye ek interface banaya
interface ILayoutContext {
  isSidebarExpanded: boolean;
  sidebarWidth: number;
}

// ADD: Naya LayoutContext banaya.
// Yeh context sidebar ki state ko store karega.
const LayoutContext = createContext<ILayoutContext>({
  isSidebarExpanded: true,
  sidebarWidth: 256, // Default width (w-64)
});

// ADD: Ek custom hook (useLayout) banaya.
// Child components (jaise ProcedureBuilder) iska istemaal karke context ki value access kar sakte hain.
export const useLayout = () => useContext(LayoutContext);

export function MainLayout({ user, onLogout, children }: MainLayoutProps) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };


  // ADD: Dono widths ko ek jagah define kiya (Tailwind ke hisaab se)
  // w-64 = 16rem = 256px
  // w-16 = 4rem = 64px
  const SIDEBAR_OPEN_WIDTH = 256;
  const SIDEBAR_MINIMIZED_WIDTH = 64;

  // ADD: 'expanded' state ke hisaab se current width calculate ki
  const currentSidebarWidth = expanded
    ? SIDEBAR_OPEN_WIDTH
    : SIDEBAR_MINIMIZED_WIDTH;

  // FIX: Margin ki logic ko theek kiya (yeh pehle inverted thi)
  // Jab expanded (w-64) ho, tab content ka margin ml-64 hona chahiye.
  // Jab collapsed (w-16) ho, tab content ka margin ml-16 hona chahiye.
  const contentMarginClass = expanded ? "ml-64" : "ml-16";

  return (
    // ADD: Poore layout ko 'LayoutContext.Provider' se wrap kiya.
    // 'value' prop ke zariye hum 'expanded' state aur 'currentSidebarWidth' ko
    // sabhi child components ke liye available kara rahe hain.
    <LayoutContext.Provider
      value={{
        isSidebarExpanded: expanded,
        sidebarWidth: currentSidebarWidth,
      }}
    >
      <div className="flex h-screen bg-background">
        {/* Mobile sidebar backdrop */}
        {showMobileSidebar && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${
            showMobileSidebar ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-50 
           ${expanded ? "w-64" : "w-16"}  // Yeh dynamic width aapne sahi lagayi thi
           transition-all duration-300
           lg:translate-x-0 lg:static lg:inset-0`}
        >
          <Sidebar
            onClose={() => setShowMobileSidebar(false)}
            expanded={expanded}
            setExpanded={setExpanded}
            user={user}
            onLogout={handleLogout}
          />
        </div>

        {/* Main content */}
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300
           ${contentMarginClass} lg:ml-0`} // UPDATE: Yahaan fix ki hui margin class use ki
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
    </LayoutContext.Provider>
  );
}