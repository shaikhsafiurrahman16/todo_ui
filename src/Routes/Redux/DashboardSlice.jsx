import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../Axios";
import { message } from "antd";

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Unauthorized! Please login again.");
        return rejectWithValue("Unauthorized");
      }

      const [completedRes, pendingRes, allRes, reportRes] = await Promise.all([
        axios.get("/dashboard/completedTodo"),
        axios.get("/dashboard/pendingTodo"),
        axios.post("/todo/read", { page: 1, limit: 10000 }),
        axios.post("/dashboard/report", {}),
      ]);

      const chartData = Object.keys(reportRes.data.data).map((month) => ({
        month,
        todos: reportRes.data.data[month],
      }));

      return {
        completed: completedRes.data.data,
        pending: pendingRes.data.data,
        all: allRes.data.totalTodos,
        chart: chartData,
      };
    } catch (err) {
      message.error("Fail to fetch todo counts");
      return rejectWithValue(err.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    completed: 0,
    pending: 0,
    all: 0,
    chart: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.completed = action.payload.completed;
        state.pending = action.payload.pending;
        state.all = action.payload.all;
        state.chart = action.payload.chart;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
