import { configureStore } from "@reduxjs/toolkit";
import socketMiddleware from './messages/socketMiddleware';

import userReducer from "./userSlice";
// import { usersReducer } from "./users";
// import { organizationsReducer } from "./organization";
import { assetsReducer } from "./assets";
import { automationsReducer } from "./automations";
// import { categoriesReducer } from "./categories";
// import { metersReducer } from "./meters";
import { partsReducer } from "./parts";
// import { locationsReducer } from "./locations";
// import { proceduresReducer } from "./procedures";
// import { purchaseOrdersReducer } from "./purchaseOrders";
// import { teamMembersReducer } from "./teamMembers";
// import { teamsReducer } from "./teams";
// import { vendorsReducer } from "./vendors";
import { workOrdersReducer } from "./workOrders";
// import { attachmentsReducer } from "./attachments";
// import { auditLogsReducer } from "./auditLogs";
// import { storageReducer } from "./storage";
import { authReducer } from "./auth";
import { messageReducer } from "./messages";

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    messaging: messageReducer,
    workOrders: workOrdersReducer,
    automations: automationsReducer,
    // users: usersReducer,
    // organizations: organizationsReducer,
    assets: assetsReducer,
    // categories: categoriesReducer,
    // meters: metersReducer,
    parts: partsReducer,
    // locations: locationsReducer,
    // procedures: proceduresReducer,
    // purchaseOrders: purchaseOrdersReducer,
    // teamMembers: teamMembersReducer,
    // teams: teamsReducer,
    // vendors: vendorsReducer,
    // workOrders: workOrdersReducer,
    // attachments: attachmentsReducer,
    // auditLogs: auditLogsReducer,
    // storage: storageReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
