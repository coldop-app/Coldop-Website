import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/slices/authSlice";
import Loader from "@/components/common/Loader/Loader";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import axios from "axios";

const StoreAdminLoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    mobileNumber: "",
    password: "",
    rememberMe: false
  });

  const updateFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return storeAdminApi.login({
        mobileNumber: data.mobileNumber,
        password: data.password,
        isMobile: true
      });
    },
    onSuccess: (data) => {
      dispatch(setCredentials(data.data));
      toast.success("Login successful!");
      navigate('/erp/daybook');
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Login failed");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 sm:p-8 bg-background rounded-lg shadow-lg border border-border">
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Store Admin Login</h1>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-medium mb-1">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={updateFormData}
            className="w-full p-3 border border-border rounded-md bg-background"
            required
            placeholder="Enter your mobile number"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={updateFormData}
            className="w-full p-3 border border-border rounded-md bg-background"
            required
            placeholder="Enter your password"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={updateFormData}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm font-medium">
              Remember me
            </label>
          </div>

          <a href="#" className="text-sm text-green-600 hover:underline text-right sm:text-left">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full font-custom inline-block cursor-pointer rounded-lg bg-primary px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <div className="flex items-center justify-center">
              <Loader size="sm" className="mr-2" />
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup/store-admin" className="text-green-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StoreAdminLoginForm;