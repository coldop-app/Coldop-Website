import { useState } from "react";

const FarmerLoginForm = () => {
  const [formData, setFormData] = useState({
    mobileNumber: "",
    accountNumber: "",
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
    console.log("Farmer login form submitted:", formData);
    // Navigate to dashboard upon successful login
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-background rounded-lg shadow-lg border border-border">
      <h1 className="text-2xl font-bold text-center mb-6">Farmer Login</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          />
        </div>

        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium mb-1">
            Account Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="accountNumber"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={updateFormData}
            className="w-full p-3 border border-border rounded-md bg-background"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your account number provided by your cold storage manager
          </p>
        </div>

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

        <button
          type="submit"
          className="w-full font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary"
        >
          Sign in
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <span className="text-gray-600">
            Contact your cold storage manager to create an account for you.
          </span>
        </p>
      </div>
    </div>
  );
};

export default FarmerLoginForm;