import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../Axios";
import dayjs from "dayjs";

const pageSize = 8;

// ✅ Get All Todos
export const getTodos = createAsyncThunk(
  "todo/getTodos",
  async ({ page = 1, search, color, priority }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/todo/read", {
        page,
        limit: pageSize,
        search,
        color,
        priorty: priority,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ Get Overdue Todos
export const OverdueTodos = createAsyncThunk(
  "todo/OverdueTodos",
  async ({ page = 1, search, color, priority }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/todo/overdue", {
        page,
        limit: pageSize,
        search,
        color,
        priorty: priority,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ Create or Update Todo
export const addTodo = createAsyncThunk(
  "todo/addTodo",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const payload = {
        ...values,
        duedate: values.duedate
          ? dayjs(values.duedate).format("YYYY-MM-DD HH:mm:ss")
          : null,
      };
      if (id) {
        const res = await axios.put("/todo/update", { id, ...payload });
        return res.data;
      } else {
        const res = await axios.post("/todo/create", payload);
        return res.data;
      }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ Delete Todo
export const deleteTodo = createAsyncThunk(
  "todo/deleteTodo",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.post("/todo/delete", { id });
      return { id, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ NEW: Get Todo by ID (for Edit Modal)
export const getTodoById = createAsyncThunk(
  "todo/getTodoById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.post("/todo/getTodoById", { id });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const todoSlice = createSlice({
  name: "todo",
  initialState: {
    todos: [],
    total: 0,
    selectedTodo: null, // 👈 yahan store hoga jo edit karna hai
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
  

    builder.addCase(getTodos.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getTodos.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.status) {
        state.todos = action.payload.data;
        state.total = action.payload.totalTodos;
      } else {
        state.todos = [];
        state.total = 0;
      }
    });
    builder.addCase(getTodos.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "Failed to fetch todos";
    });


    builder.addCase(OverdueTodos.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(OverdueTodos.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.status) {
        state.todos = action.payload.data;
        state.total = action.payload.totalOverdue;
      } else {
        state.todos = [];
        state.total = 0;
      }
    });
    builder.addCase(OverdueTodos.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "Failed to fetch overdue todos";
    });


    builder.addCase(addTodo.fulfilled, (state) => {});


    builder.addCase(deleteTodo.fulfilled, (state, action) => {
      const id = action.payload.id;
      state.todos = state.todos.filter((t) => t.Id !== id);
      state.total = state.total > 0 ? state.total - 1 : 0;
    });
    

    builder.addCase(getTodoById.pending, (state) => {
      state.loading = true;
      state.selectedTodo = null;
    });
    builder.addCase(getTodoById.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.status) {
        state.selectedTodo = action.payload.data; 
      } else {
        state.selectedTodo = null;
      }
    });
    builder.addCase(getTodoById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "Failed to fetch todo details";
    });
  },
});

export default todoSlice.reducer;
