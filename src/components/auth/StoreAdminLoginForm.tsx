import { useState } from "react";
import { Link } from "react-router-dom";

const StoreAdminLoginForm = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would call an API
    console.log("Login form submitted:", formData);
    // Navigate to dashboard upon successful login
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
        >
          Sign in
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