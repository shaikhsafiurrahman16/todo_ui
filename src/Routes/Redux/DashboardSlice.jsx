import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../Axios";

// Async thunk for fetching dashboard data
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const completedTodos = await axios.get("/dashboard/completedTodo");
      const pendingTodos = await axios.get("/dashboard/pendingTodo");
      const alltodos = await axios.post("/todo/read", { page: 1, limit: 10000 });
      const reportRes = await axios.post("/dashboard/report", {});

      return {
        completed: completedTodos.data.data,
        pending: pendingTodos.data.data,
        all: alltodos.data.totalTodos,
        chart: Object.keys(reportRes.data.data).map((month) => ({
          month,
          todos: reportRes.data.data[month],
        })),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
        state.error = null;
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
