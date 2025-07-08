import React from "react";
import { LogOut, ChevronLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { logout } from "@/slices/authSlice";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "@/utils/const";
// Import Shadcn components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RootState } from "@/store";
import { StoreAdmin } from "@/utils/types";

interface TopBarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: () => void;
  title?: string;
}

const logoutUser = async () => {
  await axios.post(`${BASE_URL}/api/store-admin/logout`, {});
};

const TopBar: React.FC<TopBarProps> = ({
  title = "Dashboard",
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { adminInfo } = useSelector((state: RootState) => state.auth) as { adminInfo: StoreAdmin | null };

  const isDaybookScreen = location.pathname.includes('/daybook');

  const mutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(logout());
      toast.success("Logged out successfully!");
      navigate("/");
    },
    onError: () => {
      toast.error("Logout failed. Please try again.");
    },
  });

  const handleLogout = () => {
    mutation.mutate();
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Get the first letter of the name for the avatar fallback
  const getInitials = () => {
    if (adminInfo?.name) {
      return adminInfo.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="bg-background/95 backdrop-blur-md shadow-sm z-50 sticky top-0 border-b border-border/40">
      <div className="flex items-center justify-between p-2 sm:p-4">
        <div className="flex items-center min-w-0 flex-1">
          {!isDaybookScreen && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 sm:hidden"
              onClick={handleBack}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-base sm:text-xl font-semibold ml-2 sm:ml-4 truncate">{title}</h1>
        </div>
        <div className="flex items-center flex-shrink-0 ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                  {adminInfo?.imageUrl ? (
                    <img src={adminInfo.imageUrl} alt="User avatar" />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium text-sm sm:text-base inline truncate max-w-[120px]">
                  {adminInfo?.name || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="flex items-center cursor-pointer"
                onClick={handleLogout}
                disabled={mutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>{mutation.isPending ? "Logging out..." : "Logout"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopBar;