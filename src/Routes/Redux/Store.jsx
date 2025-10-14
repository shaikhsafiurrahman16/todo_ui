import {configureStore} from "@reduxjs/toolkit";
import todoReducer from './TodoSlice'
import userReducer from './UserSlice'
import dashboardSlice from './DashboardSlice'
import authSlice from "./AuthSlice";

export const store = configureStore({
    reducer: {
        todo: todoReducer,
        user: userReducer,
        dashboard: dashboardSlice,
        auth: authSlice, 
    }
})