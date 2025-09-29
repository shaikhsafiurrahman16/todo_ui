import { BrowserRouter, Route, Routes } from "react-router-dom";
import "antd/dist/reset.css";
import DashboardLayout from "./Routes/Dashboard/DasboardLayout";
import Login from "./Routes/Login/login";
import Signup from "./Routes/Signup/Singup";
import ProtectedRoute from "./Routes/ProtectedRoute";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
