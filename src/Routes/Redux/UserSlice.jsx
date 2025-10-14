import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../Axios";

export const getUsers = createAsyncThunk(
  "user/getUsers",
  async ({ page = 1, limit = 8 }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/user/userRead", { page, limit });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete("/user/userDelete", { data: { id } });
      return { ...res.data, id };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const addUser = createAsyncThunk(
  "user/saveUser",
  async (values, { rejectWithValue }) => {
    try {
      let res;
      if (values.id) res = await axios.put("/user/userUpdate", values);
      else res = await axios.post("/auth/register", values);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // 🔹 Fetch Users
    builder.addCase(getUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getUsers.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.status) {
        state.users = action.payload.data;
        state.total = action.payload.totalUsers;
      } else {
        state.users = [];
        state.total = 0;
      }
    });
    builder.addCase(getUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch users";
    });


    builder.addCase(deleteUser.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.users = state.users.filter((u) => u.Id !== action.payload.id);
        state.total = state.total > 0 ? state.total - 1 : 0;
      }
    });


    builder.addCase(addUser.fulfilled, (state, action) => {
      
    });
  },
});

export default userSlice.reducer;
