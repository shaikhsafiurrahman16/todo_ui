import { configureStore } from "@reduxjs/toolkit";
import dashboardSlice from "./DashboardSlice.jsx";

export const store = configureStore({
  reducer: {
    dashboard: dashboardSlice,
  },
});
