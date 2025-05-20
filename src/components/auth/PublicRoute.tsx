import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const PublicRoute = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  return adminInfo ? <Navigate to="/erp/daybook" replace /> : <Outlet />;
};

export default PublicRoute;