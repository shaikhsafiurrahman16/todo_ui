import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./Redux/userSlice";


function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const dipatch = useDispatch();
  if (!token) {
    return children;
  } else {
    try {
    const decoded = jwtDecode(token);
    dipatch(login({...decoded}))
    const data = useSelector( (state) => state.user)
    return <Navigate to="/app/dashboard" />;   
  } catch (err) {
    console.log(err)
    localStorage.removeItem("token");
    return children;
  }
  }
}

export default PublicRoute;
