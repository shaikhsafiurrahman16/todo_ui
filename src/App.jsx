import { BrowserRouter, Route, Routes } from "react-router-dom";
import "antd/dist/reset.css";
import Todo from "./Routes/Dashboard/Todo";
import Setting from "./Routes/Dashboard/Setting";
import User from "./Routes/Dashboard/User";
import Dashboard from "./Routes/Dashboard/Dashboard";
import DashboardLayout from "./Routes/Dashboard/DasboardLayout";
import Login from "./Routes/Login/login";
import Signup from "./Routes/Signup/Singup";
import ProtectedRoute from './Routes/ProtectedRoute'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="todo" element={<Todo />} />
            <Route path="user" element={<User />} />
            <Route path="setting" element={<Setting />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
