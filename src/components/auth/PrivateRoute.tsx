import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const PrivateRoute = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  return adminInfo ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;