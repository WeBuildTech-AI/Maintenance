import { useState } from "react";
import { MainLayout } from "./components/MainLayout";
import { Login } from "./components/Login";
import { WorkOrders } from "./components/WorkOrders";
import { PurchaseOrders } from "./components/purchase-orders/PurchaseOrders";
import { Assets } from "./components/Assets";
import { Inventory } from "./components/Inventory";
import { Reporting } from "./components/Reporting";
import { Messages } from "./components/Messages";
import { Categories } from "./components/Categories";
import { Library } from "./components/Library";
import { Meters } from "./components/Meters";
import { Automations } from "./components/Automations";
import { Locations } from "./components/Locations";
import { TeamUsers } from "./components/TeamUsers";
import { Vendors } from "./components/vendors/Vendors";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [currentModule, setCurrentModule] = useState("work-orders");
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);

  const handleLogin = (userData: { name: string; email: string; avatar?: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentModule("work-orders");
  };

  // Show login if user is not authenticated
  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  const renderCurrentModule = () => {
    switch (currentModule) {
      case "work-orders":
        return <WorkOrders />;
      case "purchase-orders":
        return <PurchaseOrders />;
      case "reporting":
        return <Reporting />;
      case "assets":
        return <Assets />;
      case "messages":
        return <Messages />;
      case "categories":
        return <Categories />;
      case "inventory":
        return <Inventory />;
      case "library":
        return <Library />;
      case "vendors":
        return <Vendors />;
      case "meters":
        return <Meters />;
      case "automations":
        return <Automations />;
      case "locations":
        return <Locations />;
      case "team-users":
        return <TeamUsers />;
      default:
        return <WorkOrders />;
    }
  };

  return (
    <>
      <MainLayout 
        currentModule={currentModule} 
        onModuleChange={setCurrentModule}
        user={user}
        onLogout={handleLogout}
      >
        {renderCurrentModule()}
      </MainLayout>
      <Toaster />
    </>
  );
}
