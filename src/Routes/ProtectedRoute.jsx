import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);

    if (role && decoded.role !== role) {
      return <Navigate to="/app/dashboard" />;
    } else {
      return children;
    }
  } catch (err) {
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
}

export default ProtectedRoute;
