import { BrowserRouter, Route, Routes } from "react-router-dom";
import "antd/dist/reset.css";
import DashboardLayout from "./Routes/Dashboard/DasboardLayout";
import Login from "./Routes/Login/login";
import ProtectedRoute from "./Routes/ProtectedRoute";
import NotFound from "./notFound";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
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
