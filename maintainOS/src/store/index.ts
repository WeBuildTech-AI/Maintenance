import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import usersReducer from "./api/usersSlice";
import organizationsReducer from './api/organizationSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    users: usersReducer,
    organizations: organizationsReducer
  },
});

// Infer RootState & AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
