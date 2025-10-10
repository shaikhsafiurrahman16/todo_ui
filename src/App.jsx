import { BrowserRouter, Route, Routes } from "react-router-dom";
import "antd/dist/reset.css";
import DashboardLayout from "./Routes/Dashboard/DasboardLayout";
import Login from "./Routes/Login/login";
import Signup from "./Routes/Signup/Singup";
import ProtectedRoute from "./Routes/ProtectedRoute";
import NotFound from "./notFound";
import axios from "axios";

axios.interceptors.response.use(
  (res) => {
    if (res.data && res.data.redirect) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return res;
  },
  (err) => Promise.reject(err)
);

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
