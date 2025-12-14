/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react";
import { X, Loader2, HelpCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import debounce from "lodash/debounce";
import toast from "react-hot-toast";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

/* =======================
   Types
======================= */

export interface EditFarmerFormData {
  farmerId: string;
  name: string;
  address: string;
  mobileNumber: string;
  costPerBag?: number | null;
}

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  farmerId: string;
  createdAt: string;
  imageUrl?: string;
  costPerBag?: number | null;
}

interface EditFarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  token: string;
  farmer: Farmer | null;
  onFarmerUpdate?: (updatedFarmer: Farmer) => void;
}

/* =======================
   Component
======================= */

const EditFarmerModal: React.FC<EditFarmerModalProps> = ({
  isOpen,
  onClose,
  token,
  farmer,
  onFarmerUpdate,
}) => {
  const queryClient = useQueryClient();

  /* ---------- Fetch registered farmer IDs ---------- */
  const { data: farmerIdsData } = useQuery({
    queryKey: ["farmerIds"],
    queryFn: () => storeAdminApi.checkFarmerId(token),
    enabled: isOpen,
  });

  /* ---------- Mutation ---------- */
  const updateFarmerMutation = useMutation({
    mutationFn: async (payload: EditFarmerFormData) => {
      if (!farmer?._id) {
        throw new Error("Farmer ID is required");
      }
      return storeAdminApi.updateFarmer(farmer._id, payload, token);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] });

      if (onFarmerUpdate && response?.data?.data) {
        onFarmerUpdate(response.data.data);
      }

      toast.success("Farmer updated successfully!");
      onClose();
    },
    onError: (error: unknown) => {
      console.error("Error updating farmer:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update farmer"
      );
    },
  });

  /* ---------- State ---------- */
  const [formData, setFormData] = useState<EditFarmerFormData>({
    farmerId: "",
    name: "",
    address: "",
    mobileNumber: "",
    costPerBag: null,
  });

  const [farmerIdError, setFarmerIdError] = useState("");

  /* ---------- Populate form ---------- */
  useEffect(() => {
    if (farmer && isOpen) {
      setFormData({
        farmerId: farmer.farmerId ?? "",
        name: farmer.name ?? "",
        address: farmer.address ?? "",
        mobileNumber: farmer.mobileNumber ?? "",
        costPerBag: farmer.costPerBag ?? null,
      });
      setFarmerIdError("");
    }
  }, [farmer, isOpen]);

  /* ---------- Debounced Farmer ID check ---------- */
  const debouncedCheckFarmerId = useMemo(
    () =>
      debounce(
        (id: string, registeredFarmers: string[], currentFarmerId: string) => {
          if (id === currentFarmerId) {
            setFarmerIdError("");
            return;
          }

          if (registeredFarmers.includes(id)) {
            setFarmerIdError(
              `Farmer ID ${id} is already taken. Please use a different ID.`
            );
          } else {
            setFarmerIdError("");
          }
        },
        500
      ),
    []
  );

  /* ---------- Input handler ---------- */
  const handleChange = (field: keyof EditFarmerFormData, value: string) => {
    if (field === "farmerId") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, farmerId: numericValue }));

      if (numericValue && farmerIdsData?.data?.registeredFarmers && farmer) {
        debouncedCheckFarmerId(
          numericValue,
          farmerIdsData.data.registeredFarmers,
          farmer.farmerId
        );
      }
      return;
    }

    if (field === "mobileNumber") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, mobileNumber: numericValue }));
      }
      return;
    }

    if (field === "costPerBag") {
      const numericValue = value.replace(/[^0-9.]/g, "");
      setFormData((prev) => ({
        ...prev,
        costPerBag: numericValue ? Number(numericValue) : null,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------- Submit ---------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (farmerIdError) return;

    if (formData.mobileNumber.length !== 10) {
      toast.error("Contact number must be exactly 10 digits");
      return;
    }

    updateFarmerMutation.mutate(formData);
  };

  if (!isOpen || !farmer) return null;

  /* =======================
     JSX
  ======================= */

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          disabled={updateFarmerMutation.isPending}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">Edit Farmer</h2>

        {/* Farmer ID Info */}
        <div className="mb-4 p-3 bg-secondary/50 rounded-md flex justify-between">
          <div>
            <p className="text-sm font-medium">
              Current Farmer ID: {farmer.farmerId}
            </p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button type="button">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <h4 className="font-medium mb-2">Used Farmer IDs</h4>
              <div className="grid grid-cols-5 gap-2">
                {farmerIdsData?.data?.registeredFarmers?.map((id: string) => (
                  <div
                    key={id}
                    className={`px-2 py-1 rounded text-sm text-center ${
                      id === farmer.farmerId
                        ? "ring-2 ring-primary"
                        : "bg-secondary"
                    }`}
                  >
                    {id}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={formData.farmerId}
            onChange={(e) => handleChange("farmerId", e.target.value)}
            placeholder="Farmer ID"
            className="w-full p-3 border rounded"
          />
          {farmerIdError && (
            <p className="text-xs text-red-500">{farmerIdError}</p>
          )}

          <input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Name"
            className="w-full p-3 border rounded"
          />

          <input
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Address"
            className="w-full p-3 border rounded"
          />

          <input
            value={formData.mobileNumber}
            onChange={(e) => handleChange("mobileNumber", e.target.value)}
            placeholder="Mobile Number"
            className="w-full p-3 border rounded"
          />

          <input
            type="number"
            value={formData.costPerBag ?? ""}
            onChange={(e) => handleChange("costPerBag", e.target.value)}
            placeholder="Cost per bag"
            className="w-full p-3 border rounded"
          />

          <button
            type="submit"
            disabled={updateFarmerMutation.isPending}
            className="w-full py-3 bg-primary text-white rounded"
          >
            {updateFarmerMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              "Update Farmer"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditFarmerModal;
