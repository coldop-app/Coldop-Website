import React from "react";
import { Menu, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { logout } from "@/slices/authSlice";
import axios from "axios";
import { BASE_URL } from "@/utils/const";

// Import Shadcn components
import { Button } from "@/components/ui/button";

interface TopBarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
}

const logoutUser = async () => {
  await axios.post(`${BASE_URL}/logout`, {});
};

const TopBar: React.FC<TopBarProps> = ({
  setIsSidebarOpen,
  title = "Dashboard",
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(logout());
      toast.success("Logged out successfully!");
      navigate("/login");
    },
    onError: () => {
      toast.error("Logout failed. Please try again.");
    },
  });

  const handleLogout = () => {
    mutation.mutate();
  };

  return (
    <header className="bg-background shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground focus:outline-none md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold ml-4">{title}</h1>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="flex items-center text-muted-foreground hover:text-primary"
            onClick={handleLogout}
            disabled={mutation.isPending}
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span>{mutation.isPending ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;