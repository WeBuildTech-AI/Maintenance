import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import usersReducer from "./api/usersSlice";
import organizationsReducer from "./api/organizationSlice";
import assetsReducer from "./api/assetsSlice";
import automationsReducer from "./api/automationsSlice";
import categoriesReducer from "./api/categoriesSlice";
import metersReducer from "./api/metersSlice";
import partsReducer from "./api/partsSlice";
import locationsReducer from "./api/locationsSlice";
import proceduresReducer from "./api/proceduresSlice";
import purchaseOrdersReducer from "./purchaseOrdersSlice";
import teamMembersReducer from "./teamMembersSlice";
import teamsReducer from "./teamsSlice";
import vendorsReducer from "./vendorsSlice";
import workOrdersReducer from "./workOrdersSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    users: usersReducer,
    organizations: organizationsReducer,
    assets: assetsReducer,
    automations: automationsReducer,
    categories: categoriesReducer,
    meters: metersReducer,
    parts: partsReducer,
    locations: locationsReducer,
    procedures: proceduresReducer,
    purchaseOrders: purchaseOrdersReducer,
    teamMembers: teamMembersReducer,
    teams: teamsReducer,
    vendors: vendorsReducer,
    workOrders: workOrdersReducer,
  },
});

// Infer RootState & AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
