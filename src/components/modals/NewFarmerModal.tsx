import React, { useState, useMemo } from "react";
import { X, Loader2, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import debounce from "lodash/debounce";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export interface NewFarmerFormData {
  accNo: string;
  name: string;
  address: string;
  contact: string;
}

interface NewFarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewFarmerFormData) => void;
  isLoading: boolean;
  token: string;
}

const NewFarmerModal: React.FC<NewFarmerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  token
}) => {
  const { data: farmerIdsData } = useQuery({
    queryKey: ['farmerIds'],
    queryFn: () => storeAdminApi.checkFarmerId(token),
    enabled: isOpen, // Only fetch when modal is open
  });

  const [formData, setFormData] = useState<NewFarmerFormData>({
    accNo: "",
    name: "",
    address: "",
    contact: ""
  });
  const [accNoError, setAccNoError] = useState<string>("");

  // Create a debounced function to check farmer ID
  const debouncedCheckFarmerId = useMemo(
    () =>
      debounce((id: string, registeredFarmers: string[]) => {
        if (registeredFarmers.includes(id)) {
          setAccNoError(`Farmer ID ${id} is already taken. Please use a different ID.`);
        } else {
          setAccNoError("");
        }
      }, 500),
    []
  );

  const handleChange = (field: keyof NewFarmerFormData, value: string) => {
    // Handle numeric-only validation for accNo field
    if (field === 'accNo') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [field]: numericValue }));

      // Debounced check for existing farmer ID
      if (numericValue && farmerIdsData?.data?.registeredFarmers) {
        debouncedCheckFarmerId(numericValue, farmerIdsData.data.registeredFarmers);
      } else {
        setAccNoError("");
      }
      return;
    }

    // Handle numeric-only validation and 10-digit limit for contact field
    if (field === 'contact') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [field]: numericValue }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that the farmer ID doesn't exist
    if (farmerIdsData?.data?.registeredFarmers?.includes(formData.accNo)) {
      setAccNoError(`Farmer ID ${formData.accNo} is already taken. Please use a different ID.`);
      return;
    }

    // Don't submit if there's an error with the account number
    if (accNoError) {
      return;
    }

    // Validate contact number length
    if (formData.contact.length !== 10) {
      alert('Contact number must be exactly 10 digits');
      return;
    }

    onSubmit(formData);
    // Reset form data after submission
    setFormData({
      accNo: "",
      name: "",
      address: "",
      contact: ""
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">Add New Farmer</h2>

        <div className="mb-4 p-3 bg-secondary/50 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              {farmerIdsData?.data?.registeredFarmers?.length > 0 ? (
                <>
                  <p className="text-sm font-medium">
                    Current Farmer ID: {Math.max(...farmerIdsData.data.registeredFarmers.map((id: string) => parseInt(id)))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Next farmer will be assigned ID: {Math.max(...farmerIdsData.data.registeredFarmers.map((id: string) => parseInt(id))) + 1}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    You have no registered farmers
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The farmer will be assigned ID: 1
                  </p>
                </>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Used Farmer IDs</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {farmerIdsData?.data?.registeredFarmers?.length > 0 ? (
                      <div className="grid grid-cols-5 gap-2">
                        {farmerIdsData.data.registeredFarmers
                          .sort((a: string, b: string) => parseInt(a) - parseInt(b))
                          .map((id: string) => (
                            <div
                              key={id}
                              className="px-2 py-1 bg-secondary text-center rounded text-sm"
                            >
                              {id}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No farmer IDs registered yet</p>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Acc No.:</label>
            <input
              type="text"
              value={formData.accNo}
              onChange={(e) => handleChange("accNo", e.target.value)}
              className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
              placeholder="Enter acc no."
              required
              disabled={isLoading}
            />
            {accNoError && (
              <p className="text-xs text-red-500 mt-1">{accNoError}</p>
            )}
          </div>

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
            <label className="block text-sm font-medium mb-2">Contact:</label>
            <input
              type="tel"
              value={formData.contact}
              onChange={(e) => handleChange("contact", e.target.value)}
              className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
              placeholder="Enter 10-digit mobile no."
              pattern="[0-9]{10}"
              maxLength={10}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.contact.length}/10 digits
            </p>
          </div>

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
                  <span>Creating...</span>
                </div>
              ) : (
                "Add Farmer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFarmerModal;