import { useState, useEffect, ReactNode } from "react";
import { Link } from "react-router-dom";

interface AnimatedFormStepProps {
  isVisible: boolean;
  children: ReactNode;
}

const AnimatedFormStep = ({ isVisible, children }: AnimatedFormStepProps) => {
  const [opacity, setOpacity] = useState(0);
  const [transform, setTransform] = useState("translateY(15px)");

  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => {
        setOpacity(1);
        setTransform("translateY(0)");
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setOpacity(0);
      setTransform("translateY(15px)");
    }
  }, [isVisible]);

  return (
    <div
      style={{
        opacity,
        transform,
        position: "relative",
        transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), transform 500ms cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      {children}
    </div>
  );
};

const StoreAdminSignupForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal details
    name: "",
    personalAddress: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    imageUrl: "",

    // Cold storage details
    coldStorageName: "",
    coldStorageAddress: "",
    coldStorageContactNumber: "",
    capacity: "",

    // Preferences
    bagSizes: ["ration", "seed", "number-12", "goli", "cut-tok"]
  });

  const updateFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBagSizeToggle = (bagSize: string) => {
    setFormData(prev => {
      const currentBagSizes = [...prev.bagSizes];

      if (currentBagSizes.includes(bagSize)) {
        return {
          ...prev,
          bagSizes: currentBagSizes.filter(size => size !== bagSize)
        };
      } else {
        return {
          ...prev,
          bagSizes: [...currentBagSizes, bagSize]
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would call an API
    console.log("Form submitted:", formData);
    // Navigate to success page or show success message
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background rounded-lg shadow-lg border border-border">
      <h1 className="text-2xl font-bold text-center mb-6">Create Store Admin Account</h1>

      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="w-[90%] max-w-md">
            {/* Progress steps container */}
            <div className="relative flex justify-between">
              {/* Line from 1 to 2 - background */}
              <div className="absolute h-0.5 bg-muted top-5 left-10 w-[calc(50%-20px)]"></div>

              {/* Line from 2 to 3 - background */}
              <div className="absolute h-0.5 bg-muted top-5 left-[calc(50%+10px)] w-[calc(50%-25px)]"></div>

              {/* Line from 1 to 2 - active */}
              <div
                className={`absolute h-0.5 top-5 left-10 w-[calc(50%-20px)] transition-colors duration-500 ease-in-out ${
                  currentStep >= 2 ? 'bg-primary' : 'bg-muted'
                }`}
              ></div>

              {/* Line from 2 to 3 - active */}
              <div
                className={`absolute h-0.5 top-5 left-[calc(50%+10px)] w-[calc(50%-25px)] transition-colors duration-500 ease-in-out ${
                  currentStep >= 3 ? 'bg-primary' : 'bg-muted'
                }`}
              ></div>

              {/* Step 1 */}
              <div className="relative flex flex-col items-center">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'
                }`}>
                  1
                </div>
                <span className="text-xs mt-2 text-center">Personal</span>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <span className="text-xs mt-2 text-center">Storage</span>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 3 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'
                }`}>
                  3
                </div>
                <span className="text-xs mt-2 text-center">Preferences</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        <AnimatedFormStep isVisible={currentStep === 1}>
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={updateFormData}
                  className="w-full p-3 border border-border rounded-md bg-background"
                  required
                />
              </div>

              <div>
                <label htmlFor="personalAddress" className="block text-sm font-medium mb-1">
                  Personal Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="personalAddress"
                  name="personalAddress"
                  value={formData.personalAddress}
                  onChange={updateFormData}
                  className="w-full p-3 border border-border rounded-md bg-background"
                  rows={3}
                  required
                />
              </div>

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
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={updateFormData}
                  className="w-full p-3 border border-border rounded-md bg-background"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </AnimatedFormStep>

        {/* Step 2: Cold Storage Information */}
        <AnimatedFormStep isVisible={currentStep === 2}>
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="coldStorageName" className="block text-sm font-medium mb-1">
                  Cold Storage Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="coldStorageName"
                  name="coldStorageName"
                  value={formData.coldStorageName}
                  onChange={updateFormData}
                  className="w-full p-3 border border-border rounded-md bg-background"
                  required
                />
              </div>

              <div>
                <label htmlFor="coldStorageAddress" className="block text-sm font-medium mb-1">
                  Cold Storage Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="coldStorageAddress"
                  name="coldStorageAddress"
                  value={formData.coldStorageAddress}
                  onChange={updateFormData}
                  className="w-full p-3 border border-border rounded-md bg-background"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label htmlFor="coldStorageContactNumber" className="block text-sm font-medium mb-1">
                  Cold Storage Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="coldStorageContactNumber"
                  name="coldStorageContactNumber"
                  value={formData.coldStorageContactNumber}
                  onChange={updateFormData}
                  className="w-full p-3 border border-border rounded-md bg-background"
                  required
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium mb-1">
                  Total Storage Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={updateFormData}
                  className="w-full p-3 border border-border rounded-md bg-background"
                  placeholder="Total number of bags"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The total capacity of your cold storage in number of bags
                </p>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="font-custom inline-block cursor-pointer rounded-lg bg-secondary border border-primary px-8 py-3 text-lg font-semibold text-primary no-underline duration-100 hover:bg-secondary/90"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </AnimatedFormStep>

        {/* Step 3: Preferences */}
        <AnimatedFormStep isVisible={currentStep === 3}>
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Bag Size Preferences</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the bag sizes you use in your cold storage.
                </p>

                <div className="space-y-3">
                  {["ration", "seed", "number-12", "goli", "cut-tok"].map((size) => (
                    <div key={size} className="flex items-center">
                      <input
                        type="checkbox"
                        id={size}
                        checked={formData.bagSizes.includes(size)}
                        onChange={() => handleBagSizeToggle(size)}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={size} className="ml-2 text-sm font-medium">
                        {size.charAt(0).toUpperCase() + size.slice(1).replace("-", " ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="font-custom inline-block cursor-pointer rounded-lg bg-secondary border border-primary px-8 py-3 text-lg font-semibold text-primary no-underline duration-100 hover:bg-secondary/90"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </AnimatedFormStep>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login/store-admin" className="text-green-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StoreAdminSignupForm;