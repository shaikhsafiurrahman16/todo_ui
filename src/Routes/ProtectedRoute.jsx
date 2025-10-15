import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./Redux/userSlice";


function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const dipatch = useDispatch();
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    dipatch(login({...decoded}))
    const data = useSelector( (state) => state.user)
    return children;    
  } catch (err) {
    console.log(err)
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
}

export default ProtectedRoute;
