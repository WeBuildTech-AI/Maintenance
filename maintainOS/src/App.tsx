import { Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";

import type { AppDispatch, RootState } from "./store";
import { login, logout } from "./store/userSlice";
import { lazyImport } from "./utils/lazyImport";
import InviteUsers from "./components/Users/InviteUser/InviteUser";
import CreateTeamForm from "./components/Users/CreateTeam/CreateTeam";

// ✅ Lazy imports
const Login = lazyImport(() => import("./components/Login"), "Login");
const WorkOrders = lazyImport(
  () => import("./components/work-orders/WorkOrders"),
  "WorkOrders"
);
const PurchaseOrders = lazyImport(
  () => import("./components/purchase-orders/PurchaseOrders"),
  "PurchaseOrders"
);
const Assets = lazyImport(() => import("./components/Assets/Assets"), "Assets");
const Inventory = lazyImport(
  () => import("./components/Inventory/Inventory"),
  "Inventory"
);
const Reporting = lazyImport(
  () => import("./components/Reporting"),
  "Reporting"
);
const Messages = lazyImport(
  () => import("./components/Messages/Messages"),
  "Messages"
);
const Categories = lazyImport(
  () => import("./components/Categories/Categories"),
  "Categories"
);
const Library = lazyImport(
  () => import("./components/Library/Library"),
  "Library"
);
const Meters = lazyImport(() => import("./components/Meters/Meters"), "Meters");
const Automations = lazyImport(
  () => import("./components/automations/Automations"),
  "Automations"
);

const Locations = lazyImport(
  () => import("./components/Locations/Locations"),
  "Locations"
);
const TeamUsers = lazyImport(
  () => import("./components/Users/TeamUsers"),
  "TeamUsers"
);
const Vendors = lazyImport(
  () => import("./components/vendors/Vendors"),
  "Vendors"
);
const ManageTeam = lazyImport(
  () => import("./components/Users/CreateTeam/ManageTeam"),
  "ManageTeam"
);

const ManageUser = lazyImport(
  () => import("./components/Users/InviteUser/ManageUser"),
  "ManageUser"
);

const InviteUser = lazyImport(
  () => import("./components/Users/InviteUser/InviteUser"),
  "InviteUser"
);

export default function App() {
  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  // Socket connection lifecycle management
  useEffect(() => {
    if (user?.id) {
      dispatch({ type: "socket/connect" });

      return () => {
        dispatch({ type: "socket/disconnect" });
      };
    }
  }, [dispatch, user?.id]);

  const handleLogin = (userData: {
    name: string;
    email: string;
    avatar?: string;
  }) => {
    dispatch(login(userData));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <MainLayout user={user} onLogout={handleLogout}>
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          <Routes>
            {/* Redirect root to /work-orders */}
            <Route path="/" element={<Navigate to="/work-orders" replace />} />

            {/* Actual modules */}
            <Route path="/work-orders/*" element={<WorkOrders />} />
            <Route path="/purchase-orders/*" element={<PurchaseOrders />} />
            <Route path="/reporting" element={<Reporting />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/new" element={<Messages />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/inventory/*" element={<Inventory />} />
            <Route path="/library/*" element={<Library />} />
            <Route path="/vendors/*" element={<Vendors />} />
            <Route path="/meters/*" element={<Meters />} />
            <Route path="/automations" element={<Automations />} />
            <Route path="/locations/*" element={<Locations />} />
            <Route path="/users" element={<TeamUsers />} />
            <Route path="/users/invite" element={<InviteUsers />} />
            <Route path="/users/teams/:id" element={<ManageTeam />} />
            <Route path="/users/teams" element={<ManageTeam />} />
            <Route path="/teams/create" element={<CreateTeamForm />} />
            <Route path="/users/profile/:id" element={<ManageUser />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </>
  );
}
