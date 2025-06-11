import { useState, useEffect, ReactNode, useRef, RefObject } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Check, X, Trash2, Plus, Phone } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Loader from "@/components/common/Loader/Loader";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/slices/authSlice";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import axios from "axios";

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
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  const [newBagSize, setNewBagSize] = useState("");
  const [editingBagSize, setEditingBagSize] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Add new state for OTP verification
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Add new state for error message
  const [mobileError, setMobileError] = useState("");

  // Ref to store the resend timer interval id
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultBagSizes = ["ration", "seed", "number-12", "goli", "cut-tok"];

  const otpInputRefs: RefObject<HTMLInputElement | null>[] = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const updateFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBagSize = () => {
    const trimmed = newBagSize.trim();
    if (!trimmed) return;
    // Prevent duplicates (case-insensitive)
    if (formData.bagSizes.some(size => size.toLowerCase() === trimmed.toLowerCase())) return;
    setFormData(prev => ({
      ...prev,
      bagSizes: [...prev.bagSizes, trimmed]
    }));
    setNewBagSize("");
  };

  const handleRemoveCustomBagSize = (bagSize: string) => {
    // Only allow removing if not a default
    if (!defaultBagSizes.includes(bagSize)) {
      setFormData(prev => ({
        ...prev,
        bagSizes: prev.bagSizes.filter(size => size !== bagSize)
      }));
    }
  };

  const handleEditBagSize = (bagSize: string) => {
    setEditingBagSize(bagSize);
    setEditingValue(bagSize);
  };

  const handleSaveEditBagSize = () => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    // Prevent duplicates (case-insensitive, except for the one being edited)
    if (
      formData.bagSizes.some(
        size => size.toLowerCase() === trimmed.toLowerCase() && size !== editingBagSize
      )
    ) return;
    setFormData(prev => ({
      ...prev,
      bagSizes: prev.bagSizes.map(size =>
        size === editingBagSize ? trimmed : size
      )
    }));
    setEditingBagSize(null);
    setEditingValue("");
  };

  const handleCancelEditBagSize = () => {
    setEditingBagSize(null);
    setEditingValue("");
  };

  // Add mutation for account creation
  const createAccountMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return storeAdminApi.register({
        name: data.name,
        personalAddress: data.personalAddress,
        mobileNumber: data.mobileNumber,
        coldStorageName: data.coldStorageName,
        coldStorageAddress: data.coldStorageAddress,
        coldStorageContactNumber: data.coldStorageContactNumber,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        password: data.password,
        imageUrl: data.imageUrl || "",
        isVerified: true,
        isMobile: true,
        preferences: {
          bagSizes: data.bagSizes.map(size => size.charAt(0).toUpperCase() + size.slice(1))
        }
      });
    },
    onSuccess: (data) => {
      dispatch(setCredentials(data.data));
      toast.success("Account created successfully!");
      setTimeout(() => {
        navigate('/erp/daybook');
      }, 1000);
    },
    onError: (error: unknown) => {
      console.error("Error creating account:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to create account");
      } else {
        toast.error("Failed to create account");
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate mobile verification
    if (!isMobileVerified) {
      toast.error("Please verify your mobile number first");
      return;
    }

    createAccountMutation.mutate(formData);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Add mutation for editing mobile number
  const editMobileMutation = useMutation({
    mutationFn: async (mobileNumber: string) => {
      return storeAdminApi.editMobile(mobileNumber);
    },
    onSuccess: () => {
      setIsMobileVerified(false);
      setShowOtpInput(false);
      setOtp("");
      setMobileError("");
      toast.success("Mobile number updated successfully!");
    },
    onError: (error) => {
      setMobileError("Failed to update mobile number. Please try again.");
      toast.error("Failed to update mobile number");
      console.error("Error updating mobile number:", error);
    },
  });

  // Update handleMobileNumberChange to handle editing
  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, mobileNumber: value }));
    setMobileError("");

    // If mobile was previously verified, trigger edit mobile mutation
    if (isMobileVerified) {
      editMobileMutation.mutate(value);
    }
  };

  // Add mutation for sending OTP
  const sendOtpMutation = useMutation({
    mutationFn: async (mobileNumber: string) => {
      return storeAdminApi.sendOtp(mobileNumber);
    },
    onSuccess: () => {
      setShowOtpInput(true);
      setCanResendOtp(false);
      setResendTimer(30);
      setMobileError("");
      setOtp(""); // Reset OTP when sending new OTP
      // Clear any existing interval before starting a new one
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
      resendTimerRef.current = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            if (resendTimerRef.current) clearInterval(resendTimerRef.current);
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      toast.success("OTP sent successfully!");
    },
    onError: (error) => {
      setMobileError("Failed to send OTP. Please try again.");
      toast.error("Failed to send OTP");
      console.error("Error sending OTP:", error);
    },
  });

  // Update handleSendOtp to use the mutation
  const handleSendOtp = () => {
    if (formData.mobileNumber.length !== 10) {
      setMobileError("Please enter a valid 10 digit mobile number.");
      return;
    }
    sendOtpMutation.mutate(formData.mobileNumber);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);

  // Add mutation for verifying OTP
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ mobileNumber, otp }: { mobileNumber: string; otp: string }) => {
      return storeAdminApi.verifyOtp(mobileNumber, otp);
    },
    onSuccess: () => {
      setIsMobileVerified(true);
      setShowOtpInput(false);
      toast.success("Mobile number verified successfully!");
    },
    onError: (error) => {
      setMobileError("Invalid OTP. Please try again.");
      toast.error("Failed to verify OTP");
      console.error("Error verifying OTP:", error);
    },
  });

  // Update handleVerifyOtp to use the mutation
  const handleVerifyOtp = () => {
    if (otp.length === 4) {
      verifyOtpMutation.mutate({
        mobileNumber: formData.mobileNumber,
        otp: otp
      });
    }
  };

  // Add mutation for resending OTP
  const resendOtpMutation = useMutation({
    mutationFn: async (mobileNumber: string) => {
      return storeAdminApi.resendOtp(mobileNumber);
    },
    onSuccess: () => {
      setCanResendOtp(false);
      setResendTimer(30);
      setOtp(""); // Reset OTP when resending
      // Clear any existing interval before starting a new one
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
      resendTimerRef.current = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            if (resendTimerRef.current) clearInterval(resendTimerRef.current);
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      toast.success("OTP resent successfully!");
    },
    onError: (error) => {
      setMobileError("Failed to resend OTP. Please try again.");
      toast.error("Failed to resend OTP");
      console.error("Error resending OTP:", error);
    },
  });

  // Update handleResendOtp to use the mutation
  const handleResendOtp = () => {
    if (canResendOtp) {
      resendOtpMutation.mutate(formData.mobileNumber);
    }
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
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Phone size={18} />
                      </span>
                      <input
                        type="tel"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleMobileNumberChange}
                        className={`w-full pl-10 pr-10 p-3 border border-border rounded-md bg-background font-medium text-base transition focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted/50 disabled:cursor-not-allowed ${isMobileVerified ? 'pr-10' : ''}`}
                        placeholder="Enter 10 digit mobile number"
                        required
                        disabled={isMobileVerified}
                        maxLength={10}
                      />
                      {isMobileVerified && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                          <Check size={20} />
                        </span>
                      )}
                    </div>
                    {!isMobileVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={formData.mobileNumber.length !== 10 || showOtpInput}
                        className={`w-full sm:w-auto h-[42px] sm:h-[48px] px-4 sm:px-6 rounded-md font-semibold text-base transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border ${
                          formData.mobileNumber.length === 10 && !showOtpInput
                            ? "bg-primary text-secondary hover:bg-primary/85"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                        style={{ minWidth: 0 }}
                      >
                        Send OTP
                      </button>
                    )}
                  </div>
                  {mobileError && (
                    <div className="text-xs text-red-500 mt-1 ml-1">{mobileError}</div>
                  )}
                  {showOtpInput && !isMobileVerified && (
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                          {[0, 1, 2, 3].map((index) => (
                            <input
                              key={index}
                              ref={otpInputRefs[index]}
                              type="text"
                              maxLength={1}
                              value={otp[index] || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length === 1) {
                                  const newOtp = otp.split('');
                                  newOtp[index] = value;
                                  setOtp(newOtp.join(''));
                                  // Move to next input if not last
                                  if (index < 3) {
                                    otpInputRefs[index + 1].current?.focus();
                                  }
                                } else if (value.length === 0) {
                                  // If cleared, just update
                                  const newOtp = otp.split('');
                                  newOtp[index] = '';
                                  setOtp(newOtp.join(''));
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Backspace') {
                                  if (otp[index]) {
                                    // Just clear current
                                    const newOtp = otp.split('');
                                    newOtp[index] = '';
                                    setOtp(newOtp.join(''));
                                  } else if (index > 0) {
                                    // Move to previous
                                    otpInputRefs[index - 1].current?.focus();
                                    const newOtp = otp.split('');
                                    newOtp[index - 1] = '';
                                    setOtp(newOtp.join(''));
                                  }
                                } else if (e.key.match(/^[0-9]$/) && otp[index] && index < 3) {
                                  // If already filled, move to next
                                  otpInputRefs[index + 1].current?.focus();
                                }
                              }}
                              className="w-12 h-12 text-center text-lg border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otp.length !== 4}
                          className={`h-[48px] px-5 rounded-md font-semibold text-base transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border ml-1 ${
                            otp.length === 4
                              ? "bg-primary text-secondary hover:bg-primary/85"
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                          }`}
                        >
                          Verify
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={!canResendOtp}
                          className={`font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
                            !canResendOtp ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          Resend OTP
                        </button>
                        {!canResendOtp && (
                          <span className="text-muted-foreground">
                            Resend available in {resendTimer}s
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="font-custom flex-1 cursor-pointer rounded-lg border border-primary px-0 py-3 text-base font-medium text-primary bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  style={{ minWidth: 0 }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="font-custom flex-1 cursor-pointer rounded-lg bg-primary px-0 py-3 text-base font-semibold text-secondary hover:bg-primary/85 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  style={{ minWidth: 0 }}
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
                  {[...new Set([...defaultBagSizes, ...formData.bagSizes])].map((size) => (
                    <div
                      key={size}
                      className="flex items-center gap-2 sm:gap-3 py-1 px-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      {editingBagSize === size ? (
                        <>
                          <input
                            type="text"
                            value={editingValue}
                            onChange={e => setEditingValue(e.target.value)}
                            className="ml-2 p-1 border border-border rounded w-32 sm:w-40 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') { e.preventDefault(); handleSaveEditBagSize(); }
                              if (e.key === 'Escape') { e.preventDefault(); handleCancelEditBagSize(); }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleSaveEditBagSize}
                            className="ml-1 p-1 rounded hover:bg-green-100 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                            aria-label="Save"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditBagSize}
                            className="ml-1 p-1 rounded hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            aria-label="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <label className="ml-2 text-sm font-medium flex-1 truncate">
                            {size.charAt(0).toUpperCase() + size.slice(1).replace(/-/g, " ")}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleEditBagSize(size)}
                            className="ml-1 p-1 rounded hover:bg-blue-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            aria-label="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomBagSize(size)}
                            className="ml-1 p-1 rounded hover:bg-red-100 text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                            aria-label="Remove"
                            title="Remove bag size"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex mt-4 gap-2">
                  <input
                    type="text"
                    value={newBagSize}
                    onChange={e => setNewBagSize(e.target.value)}
                    placeholder="Add custom bag size"
                    className="p-2 border border-border rounded-md bg-background flex-1 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBagSize(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddBagSize}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-primary text-secondary rounded-md font-medium text-base hover:bg-primary/85 focus:outline-none focus:ring-2 focus:ring-primary/50 transition min-w-[40px] h-[40px]"
                    style={{ minWidth: '40px' }}
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="font-custom flex-1 cursor-pointer rounded-lg border border-primary px-0 py-3 text-base font-medium text-primary bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  style={{ minWidth: 0 }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="font-custom flex-1 cursor-pointer rounded-lg bg-primary px-0 py-3 text-base font-semibold text-secondary hover:bg-primary/85 focus:outline-none focus:ring-2 focus:ring-primary/50 transition relative"
                  style={{ minWidth: 0 }}
                  disabled={createAccountMutation.isPending}
                >
                  {createAccountMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <Loader size="sm" className="mr-2" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
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