import React from "react";
import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { logout } from "@/slices/authSlice";
import axios from "axios";
import { BASE_URL } from "@/utils/const";
import { Button } from "@/components/ui/button";

interface ErpNavbarProps {
  title?: string;
}

const logoutUser = async () => {
  await axios.post(`${BASE_URL}/logout`, {});
};

const ErpNavbar: React.FC<ErpNavbarProps> = ({ title }) => {
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
    <header className="bg-background border-b border-border shadow-sm z-10 w-full">
      <div className="flex items-center justify-between px-4 md:px-8 h-16">
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-foreground font-custom">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="flex items-center text-muted-foreground hover:text-primary font-custom"
            onClick={handleLogout}
            disabled={mutation.isPending}
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span className="hidden md:inline">
              {mutation.isPending ? "Logging out..." : "Logout"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ErpNavbar;
