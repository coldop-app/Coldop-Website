import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeAdminApi } from "@/lib/api/storeAdmin";

export interface EditFarmerFormData {
  name: string;
  address: string;
  mobileNumber: string;
  costPerBag?: number;
  password?: string;
  imageUrl?: string;
}

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  farmerId: string;
  createdAt: string;
  imageUrl?: string;
  costPerBag?: number;
}

interface EditFarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: Farmer | null;
  token: string;
  onSuccess?: (updatedFarmer: Farmer) => void;
}

const EditFarmerModal: React.FC<EditFarmerModalProps> = ({
  isOpen,
  onClose,
  farmer,
  token,
  onSuccess
}) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<EditFarmerFormData>({
    name: "",
    address: "",
    mobileNumber: "",
    costPerBag: 110,
    // password: "",
    // imageUrl: ""
  });
  // const [showPasswordField, setShowPasswordField] = useState(false);

  // Initialize form data when farmer changes or modal opens
  useEffect(() => {
    if (farmer && isOpen) {
      setFormData({
        name: farmer.name || "",
        address: farmer.address || "",
        mobileNumber: farmer.mobileNumber || "",
        costPerBag: farmer.costPerBag || 110,
        // password: "",
        // imageUrl: farmer.imageUrl || ""
      });
      // setShowPasswordField(false);
    }
  }, [farmer, isOpen]);

  const updateFarmerMutation = useMutation({
    mutationFn: async (data: EditFarmerFormData) => {
      if (!farmer?._id) throw new Error("Farmer ID is required");

      // Only include fields that have values (except password which is optional)
      const payload: Partial<EditFarmerFormData> = {};
      if (data.name) payload.name = data.name;
      if (data.address) payload.address = data.address;
      if (data.mobileNumber) payload.mobileNumber = data.mobileNumber;
      if (data.costPerBag !== undefined) payload.costPerBag = data.costPerBag;
      // if (data.imageUrl) payload.imageUrl = data.imageUrl;
      // if (data.password && data.password.trim() !== "") {
      //   payload.password = data.password;
      // }

      return storeAdminApi.updateFarmer(farmer._id, payload, token);
    },
    onSuccess: (response) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['farmerStock'] });
      queryClient.invalidateQueries({ queryKey: ['farmerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['farmers'] });

      // Extract updated farmer data from response
      if (response?.data && farmer) {
        const updatedFarmer: Farmer = {
          ...farmer,
          name: response.data.name || farmer.name,
          address: response.data.address || farmer.address,
          mobileNumber: response.data.mobileNumber || farmer.mobileNumber,
          // imageUrl: response.data.imageUrl || farmer.imageUrl,
          costPerBag: response.data.costPerBag !== undefined ? response.data.costPerBag : farmer.costPerBag,
        };

        if (onSuccess) {
          onSuccess(updatedFarmer);
        }
      } else if (onSuccess && farmer) {
        // Fallback: pass the original farmer if response structure is different
        onSuccess(farmer);
      }

      onClose();
    },
    onError: (error: any) => {
      console.error("Error updating farmer:", error);
      alert(error?.response?.data?.message || "Failed to update farmer. Please try again.");
    }
  });

  const handleChange = (field: keyof EditFarmerFormData, value: string | number | undefined) => {
    // Handle numeric-only validation and 10-digit limit for mobileNumber field
    if (field === 'mobileNumber') {
      const numericValue = value?.toString().replace(/[^0-9]/g, '') || '';
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [field]: numericValue }));
      }
      return;
    }

    // Handle numeric validation for costPerBag field
    if (field === 'costPerBag') {
      const numericValue = value?.toString().replace(/[^0-9]/g, '') || '';
      const numValue = numericValue === '' ? undefined : parseInt(numericValue, 10);
      setFormData(prev => ({ ...prev, [field]: numValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mobile number length if provided
    if (formData.mobileNumber && formData.mobileNumber.length !== 10) {
      alert('Mobile number must be exactly 10 digits');
      return;
    }

    // Validate password if password field is shown and has value
    // if (showPasswordField && formData.password && formData.password.trim() !== "" && formData.password.length < 6) {
    //   alert('Password must be at least 6 characters long');
    //   return;
    // }

    updateFarmerMutation.mutate(formData);
  };

  if (!isOpen || !farmer) return null;

  const isLoading = updateFarmerMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div id="edit-farmer-modal" className="bg-background rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">Edit Farmer Information</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
              placeholder="Enter name"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address:</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
              placeholder="Enter address"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mobile Number:</label>
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => handleChange("mobileNumber", e.target.value)}
              className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
              placeholder="Enter 10-digit mobile no."
              pattern="[0-9]{10}"
              maxLength={10}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.mobileNumber.length}/10 digits
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cost Per Bag (₹):</label>
            <input
              type="number"
              value={formData.costPerBag || ""}
              onChange={(e) => handleChange("costPerBag", e.target.value)}
              className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
              placeholder="Enter cost per bag"
              min="0"
              step="1"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to keep current value
            </p>
          </div>

          {/* Image URL field commented out */}
          {/* <div>
            <label className="block text-sm font-medium mb-2">Image URL:</label>
            <input
              type="url"
              value={formData.imageUrl || ""}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
              placeholder="Enter image URL (optional)"
              disabled={isLoading}
            />
          </div> */}

          {/* Password field commented out */}
          {/* <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Password:</label>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordField(!showPasswordField);
                  if (showPasswordField) {
                    setFormData(prev => ({ ...prev, password: "" }));
                  }
                }}
                className="text-xs text-primary hover:underline"
                disabled={isLoading}
              >
                {showPasswordField ? "Don't change password" : "Change password"}
              </button>
            </div>
            {showPasswordField && (
              <input
                type="password"
                value={formData.password || ""}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
                placeholder="Enter new password (leave empty to keep current)"
                minLength={6}
                disabled={isLoading}
              />
            )}
            {!showPasswordField && (
              <p className="text-xs text-muted-foreground">
                Click "Change password" to update the farmer's password
              </p>
            )}
          </div> */}

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 border border-primary text-primary rounded-lg hover:bg-secondary/90 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-primary text-secondary rounded-lg hover:bg-primary/85 transition disabled:opacity-50 relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Updating...</span>
                </div>
              ) : (
                "Update Farmer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFarmerModal;
