import React from "react";
import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  const { adminInfo } = useSelector((state: RootState) => state.auth) as { adminInfo: StoreAdmin | null };

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

  // Get the first letter of the name for the avatar fallback
  const getInitials = () => {
    if (adminInfo?.name) {
      return adminInfo.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="bg-background shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold ml-4">{title}</h1>
        </div>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  {adminInfo?.imageUrl ? (
                    <img src={adminInfo.imageUrl} alt="User avatar" />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium">{adminInfo?.name || "User"}</span>
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