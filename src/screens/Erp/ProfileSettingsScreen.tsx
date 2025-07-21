import React, { useState, useEffect, useRef, RefObject } from "react";
import { useNavigate, useBeforeUnload } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, Upload, Check, X, Image as ImageIcon, Pencil, Trash2, Plus, Phone, GripVertical } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loader from "@/components/common/Loader/Loader";
import toast from "react-hot-toast";
import { RootState } from "@/store";
import { StoreAdmin } from "@/utils/types";
import { setCredentials } from "@/slices/authSlice";
import { storeAdminApi } from "@/lib/api/storeAdmin";

interface UpdateProfilePayload {
  name: string;
  personalAddress: string;
  mobileNumber: string;
  coldStorageName: string;
  coldStorageAddress: string;
  coldStorageContactNumber: string;
  capacity?: number;
  imageUrl: string;
  preferences: {
    bagSizes: string[];
  };
  isMobile: boolean;
  password: string;
}

// Add helper function to extract public ID from Cloudinary URL
const extractPublicId = (url: string): string | null => {
  try {
    // Example URL: https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/folder/public-id.jpg
    // We want to extract everything after the /v\d+/ part
    const matches = url.match(/\/v\d+\/(.+?)(?:\.[^.]+)?$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

// Type guard function to check if the admin is a StoreAdmin
const isStoreAdmin = (admin: unknown): admin is StoreAdmin => {
  return admin !== null &&
    typeof admin === 'object' &&
    'coldStorageDetails' in admin &&
    'name' in admin &&
    'personalAddress' in admin &&
    'mobileNumber' in admin &&
    'imageUrl' in admin;
};

const ProfileSettingsScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  // Add state for tracking unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Redirect if not logged in or not a store admin
  useEffect(() => {
    if (!adminInfo || !isStoreAdmin(adminInfo)) {
      navigate('/');
      return;
    }
  }, [adminInfo, navigate]);

  const [formData, setFormData] = useState({
    name: "",
    personalAddress: "",
    mobileNumber: "",
    coldStorageName: "",
    coldStorageAddress: "",
    coldStorageContactNumber: "",
    capacity: "",
    imageUrl: "",
    bagSizes: [] as string[]  // Initialize as empty array
  });

  // Image handling states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Bag size states
  const [newBagSize, setNewBagSize] = useState("");
  const [editingBagSize, setEditingBagSize] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Add drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Add touch reordering states
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [touchDragTimeout, setTouchDragTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isPreparingDrag, setIsPreparingDrag] = useState(false);
  const bagSizesContainerRef = useRef<HTMLDivElement>(null);

  // Drag and drop handlers for bag sizes (desktop)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newBagSizes = [...formData.bagSizes];
    const draggedItem = newBagSizes[draggedIndex];

    // Remove the dragged item
    newBagSizes.splice(draggedIndex, 1);

    // Insert at the new position
    newBagSizes.splice(dropIndex, 0, draggedItem);

    setFormData(prev => ({
      ...prev,
      bagSizes: newBagSizes
    }));

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

    // Touch reordering handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (editingBagSize !== null) return; // Don't allow reordering while editing

    // Prevent text selection
    e.preventDefault();

    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setTouchStartIndex(index);

    // Start a timeout to initiate drag after 300ms (reduced from 500ms)
    const timeout = setTimeout(() => {
      setIsTouchDragging(true);
      setDraggedIndex(index);
      setIsPreparingDrag(false);
      toast.success("Drag to reorder", { duration: 1500 });
    }, 300);

    setIsPreparingDrag(true);

    setTouchDragTimeout(timeout);
  };

      const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDragging || touchStartY === null || touchStartIndex === null) return;

    e.preventDefault();
    const touch = e.touches[0];

    // Calculate which index we're hovering over based on touch position
    if (bagSizesContainerRef.current) {
      const containerRect = bagSizesContainerRef.current.getBoundingClientRect();
      const relativeY = touch.clientY - containerRect.top;
      const itemHeight = 60; // Approximate height of each item
      const newIndex = Math.max(0, Math.min(
        formData.bagSizes.length - 1,
        Math.floor(relativeY / itemHeight)
      ));

      if (newIndex !== dragOverIndex) {
        setDragOverIndex(newIndex);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear the timeout if it hasn't fired yet
    if (touchDragTimeout) {
      clearTimeout(touchDragTimeout);
      setTouchDragTimeout(null);
    }

    if (!isTouchDragging) {
      // If we weren't dragging, this was just a tap
      setTouchStartY(null);
      setTouchStartIndex(null);
      return;
    }

    e.preventDefault();

    // Perform the reorder
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newBagSizes = [...formData.bagSizes];
      const draggedItem = newBagSizes[draggedIndex];

      // Remove the dragged item
      newBagSizes.splice(draggedIndex, 1);

      // Insert at the new position
      newBagSizes.splice(dragOverIndex, 0, draggedItem);

      setFormData(prev => ({
        ...prev,
        bagSizes: newBagSizes
      }));
    }

    // Reset all touch states
    setIsTouchDragging(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTouchStartY(null);
    setTouchStartIndex(null);
    setIsPreparingDrag(false);
  };

  const handleTouchCancel = () => {
    if (touchDragTimeout) {
      clearTimeout(touchDragTimeout);
      setTouchDragTimeout(null);
    }
    setIsTouchDragging(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTouchStartY(null);
    setTouchStartIndex(null);
    setIsPreparingDrag(false);
  };

  // Bag size handlers
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
    setFormData(prev => ({
      ...prev,
      bagSizes: prev.bagSizes.filter(size => size !== bagSize)
    }));
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

  // Initialize form data with admin info
  useEffect(() => {
    if (adminInfo && isStoreAdmin(adminInfo)) {
      setFormData({
        name: adminInfo.name || "",
        personalAddress: adminInfo.personalAddress || "",
        mobileNumber: adminInfo.mobileNumber || "",
        coldStorageName: adminInfo.coldStorageDetails.coldStorageName || "",
        coldStorageAddress: adminInfo.coldStorageDetails.coldStorageAddress || "",
        coldStorageContactNumber: adminInfo.coldStorageDetails.coldStorageContactNumber || "",
        capacity: adminInfo.coldStorageDetails.capacity?.toString() || "",
        imageUrl: adminInfo.imageUrl || "",
        bagSizes: adminInfo.preferences?.bagSizes?.map(size => size.toLowerCase()) || []
      });
      if (adminInfo.imageUrl) {
        setImagePreview(adminInfo.imageUrl);
      }
    }
  }, [adminInfo]);

  // Add state for image deletion confirmation dialog
  const [showDeleteImageDialog, setShowDeleteImageDialog] = useState(false);

  // Add mutation for deleting profile photo
  const { mutate: deletePhoto, isPending: isDeleting } = useMutation({
    mutationFn: async (publicId: string) => storeAdminApi.deleteProfilePhoto({ publicId }),
    onSuccess: () => {
      handleRemoveImage();
      toast.success('Logo deleted successfully!');
    },
    onError: (error: Error) => {
      console.error('Error deleting image:', error);
      toast.error(error.message || 'Failed to delete logo');
    }
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // If there's an existing image, show confirmation dialog
    if (formData.imageUrl) {
      setShowDeleteImageDialog(true);
      // Store the new file temporarily
      setSelectedFile(file);
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // If no existing image, proceed with normal flow
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
    }
  };

  const handleConfirmImageDelete = async () => {
    const publicId = formData.imageUrl ? extractPublicId(formData.imageUrl) : null;
    if (publicId) {
      await deletePhoto(publicId);
    } else {
      handleRemoveImage();
    }
    setShowDeleteImageDialog(false);
  };

  const handleCancelImageDelete = () => {
    setShowDeleteImageDialog(false);
    setSelectedFile(null);
    setImagePreview(formData.imageUrl);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  // React Query mutations
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateProfilePayload) => storeAdminApi.updateProfile(data, adminInfo?.token || ""),
    onSuccess: (response) => {
      // Preserve the token from current adminInfo when updating the state
      if (adminInfo?.token) {
        dispatch(setCredentials({ ...response.data, token: adminInfo.token }));
      } else {
        dispatch(setCredentials(response.data));
      }
      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      console.error('Error updating profile:', error);
      toast.error(error.message || "Failed to update profile");
    }
  });

  const { mutate: uploadPhoto, isPending: isUploading } = useMutation({
    mutationFn: (file: File) => storeAdminApi.uploadProfilePhoto(file),
    onSuccess: (response) => {
      setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
      toast.success('Logo uploaded successfully!');
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload logo');
    }
  });

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    uploadPhoto(selectedFile);
  };

  // Add mobile verification states
  const [isMobileVerified, setIsMobileVerified] = useState(true); // Start as true since it's already verified
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [mobileError, setMobileError] = useState("");
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  const otpInputRefs: RefObject<HTMLInputElement | null>[] = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Add mutations for mobile verification
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

  const sendOtpMutation = useMutation({
    mutationFn: async (mobileNumber: string) => {
      return storeAdminApi.sendOtp(mobileNumber);
    },
    onSuccess: () => {
      setShowOtpInput(true);
      setCanResendOtp(false);
      setResendTimer(30);
      setOtp("");
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

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ mobileNumber, otp }: { mobileNumber: string; otp: string }) => {
      return storeAdminApi.verifyOtp(mobileNumber, otp);
    },
    onSuccess: () => {
      setIsMobileVerified(true);
      setShowOtpInput(false);
      setIsEditingMobile(false);
      toast.success("Mobile number verified successfully!");
    },
    onError: (error) => {
      setMobileError("Invalid OTP. Please try again.");
      toast.error("Failed to verify OTP");
      console.error("Error verifying OTP:", error);
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async (mobileNumber: string) => {
      return storeAdminApi.resendOtp(mobileNumber);
    },
    onSuccess: () => {
      setCanResendOtp(false);
      setResendTimer(30);
      setOtp("");
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

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);

  // Clean up touch timeout on unmount
  useEffect(() => {
    return () => {
      if (touchDragTimeout) {
        clearTimeout(touchDragTimeout);
      }
    };
  }, [touchDragTimeout]);

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, mobileNumber: value }));
    setMobileError("");

    // If mobile was previously verified, trigger edit mobile mutation
    if (isMobileVerified) {
      editMobileMutation.mutate(value);
    }
  };

  // Add state for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Update handleEditMobileClick to show confirmation first
  const handleEditMobileClick = () => {
    setShowConfirmDialog(true);
  };

  // Add handler for confirmation
  const handleConfirmMobileEdit = () => {
    setShowConfirmDialog(false);
    setIsEditingMobile(true);
    setIsMobileVerified(false);
    toast.success("Please verify your new mobile number", {
      icon: '📱'
    });
  };

  const handleSendOtp = () => {
    if (formData.mobileNumber.length !== 10) {
      setMobileError("Please enter a valid 10 digit mobile number.");
      return;
    }
    sendOtpMutation.mutate(formData.mobileNumber);
  };

  const handleVerifyOtp = () => {
    if (otp.length === 4) {
      verifyOtpMutation.mutate({
        mobileNumber: formData.mobileNumber,
        otp: otp
      });
    }
  };

  const handleResendOtp = () => {
    if (canResendOtp) {
      resendOtpMutation.mutate(formData.mobileNumber);
    }
  };

  // Add password states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Add effect to track form changes
  useEffect(() => {
    if (adminInfo && isStoreAdmin(adminInfo)) {
      const hasChanges =
        formData.name !== (adminInfo.name || "") ||
        formData.personalAddress !== (adminInfo.personalAddress || "") ||
        formData.mobileNumber !== (adminInfo.mobileNumber || "") ||
        formData.coldStorageName !== (adminInfo.coldStorageDetails.coldStorageName || "") ||
        formData.coldStorageAddress !== (adminInfo.coldStorageDetails.coldStorageAddress || "") ||
        formData.coldStorageContactNumber !== (adminInfo.coldStorageDetails.coldStorageContactNumber || "") ||
        formData.capacity !== (adminInfo.coldStorageDetails.capacity?.toString() || "") ||
        formData.imageUrl !== (adminInfo.imageUrl || "") ||
        JSON.stringify(formData.bagSizes) !== JSON.stringify(adminInfo.preferences?.bagSizes?.map(size => size.toLowerCase()) || []) ||
        password !== "" ||
        confirmPassword !== "";

      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, password, confirmPassword, adminInfo]);

  // Add browser navigation warning
  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (hasUnsavedChanges) {
          event.preventDefault();
          event.returnValue = "";
        }
      },
      [hasUnsavedChanges]
    )
  );

  // Modify navigation handler
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedDialog(true);
    } else {
      navigate(path);
    }
  };

  const handleConfirmNavigation = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  const handleCancelNavigation = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  // Modify the submit handler to reset unsaved changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInfo || !isStoreAdmin(adminInfo)) return;

    // Validate passwords if being changed
    if (showPasswordFields) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (password && password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
    }

    // Construct base payload without password
    const basePayload = {
      name: formData.name,
      personalAddress: formData.personalAddress,
      mobileNumber: formData.mobileNumber,
      coldStorageName: formData.coldStorageName,
      coldStorageAddress: formData.coldStorageAddress,
      coldStorageContactNumber: formData.coldStorageContactNumber,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      imageUrl: formData.imageUrl,
      preferences: {
        bagSizes: formData.bagSizes.map(size => size.charAt(0).toUpperCase() + size.slice(1))
      },
      isMobile: false as const
    };

    // Only include password in payload if it's being changed and is valid
    const payload: UpdateProfilePayload = showPasswordFields && password
      ? { ...basePayload, password }
      : basePayload as UpdateProfilePayload; // Type assertion since password is optional in UpdateProfilePayload

    await updateProfile(payload);
    setHasUnsavedChanges(false);  // Reset unsaved changes after successful update
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4 -ml-4"
          onClick={() => handleNavigation('/erp/settings')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
      </div>

      {/* Add Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNavigation}>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmNavigation}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add AlertDialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Mobile Number</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to verify your new mobile number with an OTP. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmMobileEdit}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add AlertDialog for image deletion confirmation */}
      <AlertDialog open={showDeleteImageDialog} onOpenChange={setShowDeleteImageDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Current Logo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the current logo? You will need to upload a new image.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelImageDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmImageDelete}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Logo"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Profile Settings</CardTitle>
          <CardDescription>
            Update your personal and cold storage information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalAddress">Personal Address</Label>
                <textarea
                  id="personalAddress"
                  value={formData.personalAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, personalAddress: e.target.value }))}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Enter your address"
                />
              </div>

              <div>
                <Label htmlFor="mobileNumber" className="block text-sm font-medium mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
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
                        disabled={!isEditingMobile}
                        maxLength={10}
                      />
                      {isMobileVerified ? (
                        <button
                          type="button"
                          onClick={handleEditMobileClick}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
                        >
                          <Pencil size={18} />
                        </button>
                      ) : (
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

              {/* Add Password Change Section */}
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Change Password</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                  >
                    {showPasswordFields ? "Cancel" : "Change Password"}
                  </Button>
                </div>

                {showPasswordFields && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cold Storage Information Section */}
            <div className="space-y-4 pt-6">
              <h3 className="text-lg font-semibold">Cold Storage Information</h3>

              <div className="space-y-2">
                <Label htmlFor="coldStorageName">Cold Storage Name</Label>
                <Input
                  id="coldStorageName"
                  value={formData.coldStorageName}
                  onChange={(e) => setFormData(prev => ({ ...prev, coldStorageName: e.target.value }))}
                  placeholder="Enter cold storage name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coldStorageAddress">Cold Storage Address</Label>
                <textarea
                  id="coldStorageAddress"
                  value={formData.coldStorageAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, coldStorageAddress: e.target.value }))}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Enter cold storage address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coldStorageContactNumber">Cold Storage Contact Number</Label>
                <Input
                  id="coldStorageContactNumber"
                  value={formData.coldStorageContactNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, coldStorageContactNumber: e.target.value }))}
                  placeholder="Enter contact number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Storage Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Enter total storage capacity"
                />
              </div>

              <div className="space-y-2">
                <Label>Cold Storage Logo</Label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="relative">
                    {imagePreview || formData.imageUrl ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                        <img
                          src={imagePreview || formData.imageUrl}
                          alt="Cold Storage Logo"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDeleteImageDialog(true)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          title="Remove logo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-flex items-center px-4 py-2 rounded-md border border-input font-medium text-sm focus-within:ring-2 focus-within:ring-ring cursor-pointer bg-background hover:bg-muted/50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        <span>Select Logo</span>
                      </label>
                      {selectedFile && !formData.imageUrl && (
                        <Button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={isUploading}
                          variant="secondary"
                        >
                          {isUploading ? (
                            <>
                              <Loader size="sm" className="mr-2" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              <span>Upload</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="space-y-4 pt-6">
              <h3 className="text-lg font-semibold">Bag Size Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Manage the bag sizes you use in your cold storage. You can drag and drop to reorder them on desktop, or long-press (300ms) and drag on mobile devices. The item will highlight when ready to drag.
              </p>

              <div className="space-y-3" ref={bagSizesContainerRef}>
                {formData.bagSizes.map((size, index) => (
                  <div
                    key={size}
                    draggable={editingBagSize !== size}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                                         onTouchStart={(e) => handleTouchStart(e, index)}
                     onTouchMove={handleTouchMove}
                     onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchCancel}
                    className={`flex items-center gap-2 sm:gap-3 py-2 px-2 rounded-md transition-colors select-none ${
                      draggedIndex === index
                        ? 'opacity-50 bg-muted shadow-lg scale-105'
                        : dragOverIndex === index
                          ? 'bg-blue-50 border-2 border-blue-300 border-dashed'
                          : isPreparingDrag && touchStartIndex === index
                            ? 'bg-yellow-50 border-2 border-yellow-300'
                            : 'hover:bg-muted/50'
                    } ${editingBagSize !== size ? 'cursor-move' : ''} ${isTouchDragging ? 'touch-none' : ''}`}
                  >
                    {editingBagSize !== size && (
                      <div className="cursor-move text-muted-foreground">
                        <GripVertical size={16} />
                      </div>
                    )}
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
                        <span className="text-sm font-medium flex-1 truncate pointer-events-none">
                          {size.charAt(0).toUpperCase() + size.slice(1).replace(/-/g, " ")}
                        </span>
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

            <div className="pt-6">
              <Button type="submit" className="w-full" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettingsScreen;