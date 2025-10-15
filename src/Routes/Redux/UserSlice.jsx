import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("token");

const initialState = {
  name: null,
  email: null,
  role: null,
  isLogin: false,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.token = action.payload.token; 
      state.isLogin = true;
    },
    logout: (state) => {
      state.name = null;
      state.email = null;
      state.role = null;
      state.token = null;
      state.isLogin = false;
      localStorage.removeItem("token")
    },
  },
});

console.log(userSlice.reducer)

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
