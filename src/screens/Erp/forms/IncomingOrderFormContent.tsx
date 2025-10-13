import React, { useState, useEffect, useMemo, KeyboardEvent } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { storeAdminApi, CreateOrderPayload } from "@/lib/api/storeAdmin";
import { RootState } from "@/store";
import { StoreAdmin } from "@/utils/types";
import Loader from "@/components/common/Loader/Loader";
import VarietySelector from "@/components/common/VarietySelector/VarietySelector";
import { cn } from "@/lib/utils";
import debounce from "lodash/debounce";
import NewFarmerModal, {
  NewFarmerFormData,
} from "@/components/modals/NewFarmerModal";
import CustomSelect from "@/components/common/CustomSelect/CustomSelect";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";

interface AnimatedFormStepProps {
  isVisible: boolean;
  children: React.ReactNode;
}

const AnimatedFormStep = ({ isVisible, children }: AnimatedFormStepProps) => {
  const [opacity, setOpacity] = useState(0);
  const [transform, setTransform] = useState("translateY(15px)");

  useEffect(() => {
    if (isVisible) {
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
        transition:
          "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {children}
    </div>
  );
};

interface BagQuantities {
  [key: string]: string; // Make it an index signature to accept any string key
}

// Helper function to format bag size label
const formatBagSizeLabel = (bagSize: string): string => {
  // Handle special cases
  if (bagSize === "cut-tok") return "Cut & Tok";

  // For all other cases, just capitalize the first letter
  return bagSize.charAt(0).toUpperCase() + bagSize.slice(1);
};

// Helper function to convert bag size to field name
const getBagSizeFieldName = (bagSize: string): string => {
  // Convert from kebab-case to camelCase
  return bagSize.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

interface BagLocation {
  chamber: string;
  floor: string;
  row: string;
}

interface FormData {
  // Step 1
  farmerName: string;
  farmerId: string;
  quantities: BagQuantities;
  bagApproxWeights: BagQuantities; // New field for approxWeight per bag size
  generation: string;
  rouging: string;
  tuberType: string;
  grader: string;
  weighedStatus: string;
  bagType: "jute" | "leno";

  // Step 2
  bagLocations: { [key: string]: BagLocation }; // Key is bag size field name
  remarks: string;

  // Additional fields for API
  voucherNumber: number;
  dateOfSubmission: string;
  dateOfSubmissionDate: Date | undefined; // For the date picker
  variety: string;

  // Null voucher feature
  isNullVoucher: boolean;
}

// Using the CreateOrderPayload interface from the API file

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface Farmer {
  _id: string;
  name: string;
  address?: string;
  mobileNumber?: string;
}

const IncomingOrderFormContent = () => {
  const { t } = useTranslation();
  const { adminInfo } = useSelector((state: RootState) => state.auth) as {
    adminInfo: StoreAdmin | null;
  };

  // Pre-selected farmer data - only show if admin mobile number is not "9877741375"
  const farmer = useMemo<Farmer | null>(() => {
    if (adminInfo?.mobileNumber === "9877741375") {
      return null;
    }
    return {
      _id: "68d8b55df99e71019a8661f2",
      name: "Bhatti Agritech",
      address: "Jalandhar",
      mobileNumber: "9914365651",
    };
  }, [adminInfo?.mobileNumber]);

  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState(farmer?.name || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNewFarmerModalOpen, setIsNewFarmerModalOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(farmer);
  // State removed as it's no longer needed with CustomSelect

  const [formData, setFormData] = useState<FormData>({
    farmerName: farmer?.name || "",
    farmerId: farmer?._id || "",
    quantities: {},
    bagApproxWeights: {},
    bagLocations: {},
    remarks: "",
    voucherNumber: 0,
    dateOfSubmission: new Date().toISOString().split("T")[0],
    dateOfSubmissionDate: new Date(),
    variety: "",
    generation: "",
    rouging: "",
    tuberType: "",
    grader: "",
    weighedStatus: "true",
    bagType: "jute",
    isNullVoucher: false,
  });

  // Farmer search query
  const {
    data: searchResults,
    isLoading: isSearching,
    refetch,
  } = useQuery({
    queryKey: ["searchFarmers", searchQuery],
    queryFn: () =>
      storeAdminApi.searchFarmers(
        adminInfo?._id || "",
        searchQuery,
        adminInfo?.token || ""
      ),
    enabled: false, // We'll manually trigger this with the debounced function
  });

  // Create a debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        if (query.length >= 2) {
          refetch();
        }
      }, 300),
    [refetch]
  );

  // Initialize quantities, approx weights, and locations based on admin preferences
  useEffect(() => {
    if (adminInfo?.preferences?.bagSizes) {
      const initialQuantities: BagQuantities = {};
      const initialApproxWeights: BagQuantities = {};
      const initialLocations: { [key: string]: BagLocation } = {};

      adminInfo.preferences.bagSizes.forEach((bagSize) => {
        const fieldName = getBagSizeFieldName(bagSize);
        initialQuantities[fieldName] = "";
        initialApproxWeights[fieldName] = "";
        initialLocations[fieldName] = {
          chamber: "",
          floor: "",
          row: "",
        };
      });

      setFormData((prev) => ({
        ...prev,
        quantities: initialQuantities,
        bagApproxWeights: initialApproxWeights,
        bagLocations: initialLocations,
      }));
    }
  }, [adminInfo?.preferences?.bagSizes]);

  // Initialize form with default values from admin preferences
  useEffect(() => {
    if (adminInfo?.preferences?.defaults) {
      const defaults = adminInfo.preferences.defaults;
      setFormData((prev) => ({
        ...prev,
        generation: defaults.generation || "",
        rouging: defaults.rouging || "",
        tuberType: defaults.tuberType || "",
        grader: defaults.grader || "",
      }));
    }
  }, [adminInfo?.preferences?.defaults]);

  // Add useEffect to update form when farmer changes
  useEffect(() => {
    if (farmer) {
      setFormData((prev) => ({
        ...prev,
        farmerName: farmer.name,
        farmerId: farmer._id,
      }));
    }
  }, [farmer]);

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      dateOfSubmissionDate: date,
      dateOfSubmission: date ? date.toISOString().split("T")[0] : "",
    }));
  };

  const updateQuantity = (bagType: string, value: string) => {
    // Allow numbers and decimal point
    const numericValue = value.replace(/[^\d.]/g, "");
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    const validValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;

    setFormData((prev) => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [bagType]: validValue,
      },
    }));
  };

  const updateApproxWeight = (bagType: string, value: string) => {
    // Allow numbers and decimal point
    const numericValue = value.replace(/[^\d.]/g, "");
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    const validValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;

    setFormData((prev) => ({
      ...prev,
      bagApproxWeights: {
        ...prev.bagApproxWeights,
        [bagType]: validValue,
      },
    }));
  };

  const updateLocation = (
    bagType: string,
    field: keyof BagLocation,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      bagLocations: {
        ...prev.bagLocations,
        [bagType]: {
          ...prev.bagLocations[bagType],
          [field]: value,
        },
      },
    }));
  };

  const getCombinedLocation = (bagType: string): string => {
    const location = formData.bagLocations[bagType];
    if (!location) return "";

    const { chamber, floor, row } = location;

    // Show partial preview as user types
    if (chamber && !floor && !row) return `${chamber}-`;
    if (chamber && floor && !row) return `${chamber}-${floor}-`;
    if (chamber && floor && row) return `${chamber}-${floor}-${row}`;

    return "";
  };

  // Helper function to get location string for API (returns empty string if not complete)
  const getLocationForAPI = (bagType: string): string => {
    const location = formData.bagLocations[bagType];
    if (!location) return "";

    const { chamber, floor, row } = location;

    // Only return combined location if all fields are filled
    if (chamber && floor && row) {
      return `${chamber}-${floor}-${row}`;
    }

    // Return empty string if any field is missing
    return "";
  };

  const calculateTotal = () => {
    return Object.values(formData.quantities).reduce(
      (sum, quantity) => sum + (parseFloat(quantity) || 0),
      0
    );
  };

  const calculateTotalWeight = () => {
    return Object.keys(formData.quantities).reduce((sum, fieldName) => {
      const quantity = parseFloat(formData.quantities[fieldName] || "0");
      const weight = parseFloat(formData.bagApproxWeights[fieldName] || "0");
      return sum + (quantity * weight);
    }, 0);
  };

  const nextStep = () => {
    // Skip validation for null vouchers
    if (formData.isNullVoucher) {
      setCurrentStep(2);
      return;
    }

    // Validate step 1 for regular orders
    if (!formData.farmerName.trim()) {
      toast.error(t("incomingOrder.errors.enterFarmerName"));
      return;
    }
    if (!formData.variety) {
      toast.error(t("incomingOrder.errors.selectVariety"));
      return;
    }
    if (!formData.generation) {
      toast.error("Please select generation");
      return;
    }
    if (!formData.rouging) {
      toast.error("Please select rouging");
      return;
    }
    if (!formData.tuberType) {
      toast.error("Please select tuber type");
      return;
    }
    if (!formData.grader) {
      toast.error("Please select grade");
      return;
    }
    if (!formData.dateOfSubmissionDate) {
      toast.error("Please select a submission date");
      return;
    }
    if (calculateTotal() <= 0) {
      toast.error(t("incomingOrder.errors.enterQuantity"));
      return;
    }
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  // Function to find the first complete location
  const findFirstCompleteLocation = (): BagLocation | null => {
    const bagSizes = adminInfo?.preferences?.bagSizes || [];
    for (const bagSize of bagSizes) {
      const fieldName = getBagSizeFieldName(bagSize);
      const location = formData.bagLocations[fieldName];
      if (location?.chamber && location?.floor && location?.row) {
        return location;
      }
    }
    return null;
  };

  // Function to apply a location to all bag sizes with quantities
  const applyLocationToAll = (sourceLocation: BagLocation) => {
    const bagSizes = adminInfo?.preferences?.bagSizes || [];
    const newLocations = { ...formData.bagLocations };

    bagSizes.forEach((bagSize) => {
      const fieldName = getBagSizeFieldName(bagSize);
      const quantity = parseFloat(formData.quantities[fieldName] || "0");

      if (quantity > 0) {
        newLocations[fieldName] = { ...sourceLocation };
      }
    });

    setFormData((prev) => ({
      ...prev,
      bagLocations: newLocations,
    }));

    toast.success("Location applied to all bag sizes");
  };

  // Function to find the first weight value
  const findFirstWeight = (): string | null => {
    const bagSizes = adminInfo?.preferences?.bagSizes || [];
    for (const bagSize of bagSizes) {
      const fieldName = getBagSizeFieldName(bagSize);
      const weight = formData.bagApproxWeights[fieldName];
      if (weight && parseFloat(weight) > 0) {
        return weight;
      }
    }
    return null;
  };

  // Function to apply a weight to all bag sizes
  const applyWeightToAll = (sourceWeight: string) => {
    const bagSizes = adminInfo?.preferences?.bagSizes || [];
    const newWeights = { ...formData.bagApproxWeights };

    bagSizes.forEach((bagSize) => {
      const fieldName = getBagSizeFieldName(bagSize);
      // Apply weight to all bag sizes, regardless of quantity
      newWeights[fieldName] = sourceWeight;
    });

    // Force a complete state update
    setFormData((prev) => ({
      ...prev,
      bagApproxWeights: { ...newWeights },
    }));

    toast.success(`Weight ${sourceWeight} applied to all bag sizes`);
  };

  // Create incoming order mutation
  // Query for Bhatti data
  const { data: bhattiData } = useQuery({
    queryKey: ["bhattiData"],
    queryFn: () => storeAdminApi.getBhattiData(adminInfo?.token || ""),
    enabled: !!adminInfo?.token,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderPayload) => {
      if (!adminInfo?.token) {
        throw new Error("No authentication token found");
      }
      return storeAdminApi.createIncomingOrder(orderData, adminInfo.token);
    },
    onSuccess: () => {
      toast.success(t("incomingOrder.success.orderCreated"));
      // Reset form but preserve defaults
      const defaults = adminInfo?.preferences?.defaults || {};
      setFormData({
        farmerName: "",
        farmerId: "",
        quantities: {},
        bagApproxWeights: {},
        bagLocations: {},
        remarks: "",
        voucherNumber: 0,
        dateOfSubmission: new Date().toISOString().split("T")[0],
        dateOfSubmissionDate: new Date(),
        variety: "",
        generation: defaults.generation || "",
        rouging: defaults.rouging || "",
        tuberType: defaults.tuberType || "",
        grader: defaults.grader || "",
        weighedStatus: "true",
        bagType: "jute",
        isNullVoucher: false,
      });
      setCurrentStep(1);
      // Force hard refresh to ensure scroll to top
      window.location.href = "/erp/daybook";
    },
    onError: (error: unknown) => {
      console.error("Error creating order:", error);
      if (error instanceof Error) {
        const apiError = error as ApiError;
        toast.error(
          apiError.response?.data?.message ||
            t("incomingOrder.errors.failedToCreate")
        );
      } else {
        toast.error(t("incomingOrder.errors.failedToCreate"));
      }
    },
  });

  // Create farmer mutation
  const createFarmerMutation = useMutation({
    mutationFn: async (farmerData: NewFarmerFormData) => {
      if (!adminInfo?.token) {
        throw new Error("No authentication token found");
      }
      return storeAdminApi.quickRegister(
        {
          name: farmerData.name,
          address: farmerData.address,
          mobileNumber: farmerData.contact,
          password: "123456", // Hardcoded default password
          imageUrl: "",
          farmerId: farmerData.accNo,
        },
        adminInfo.token
      );
    },
    onSuccess: (data) => {
      toast.success(t("incomingOrder.success.farmerCreated"));
      // Create a farmer object with the new data
      const newFarmer: Farmer = {
        _id: data.data._id,
        name: data.data.name,
        address: data.data.address || "",
        mobileNumber: data.data.mobileNumber,
      };
      // Update form with new farmer
      setFormData((prev) => ({
        ...prev,
        farmerName: newFarmer.name,
        farmerId: newFarmer._id,
      }));
      setSearchQuery(newFarmer.name);
      // Show the farmer details by simulating a selection
      handleSelectFarmer(newFarmer);
      setSelectedFarmer(newFarmer);
      setIsNewFarmerModalOpen(false);
    },
    onError: (error: unknown) => {
      console.error("Error creating farmer:", error);
      if (error instanceof Error) {
        const apiError = error as ApiError;
        toast.error(
          apiError.response?.data?.message ||
            t("incomingOrder.errors.failedToCreateFarmer")
        );
      } else {
        toast.error(t("incomingOrder.errors.failedToCreateFarmer"));
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Handle null voucher creation
    if (formData.isNullVoucher) {
      const orderData: CreateOrderPayload = {
        coldStorageId: adminInfo?._id || "",
        farmerId: null,
        orderDetails: null,
        remarks: formData.remarks || "NULL VOUCHER - Paper tampered",
        isNullVoucher: true,
      };
      createOrderMutation.mutate(orderData);
      return;
    }

    // Get bag sizes with quantities (location validation removed)
    const bagSizesWithQuantities =
      adminInfo?.preferences?.bagSizes?.filter((bagSize) => {
        const fieldName = getBagSizeFieldName(bagSize);
        const quantity = parseFloat(formData.quantities[fieldName] || "0");
        return quantity > 0;
      }) || [];

    // Convert date to DD.MM.YYYY format
    const formatDateForAPI = (dateString: string) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      const formattedDate = `${day}.${month}.${year}`;
      console.log('Original date:', dateString, 'Formatted date:', formattedDate);
      return formattedDate;
    };

    // Prepare order data according to API structure
    const orderData: CreateOrderPayload = {
      coldStorageId: adminInfo?._id || "",
      farmerId: formData.farmerId || "temp-farmer-id",
      remarks: formData.remarks,
      generation: formData.generation,
      rouging: formData.rouging,
      tuberType: formData.tuberType,
      grader: formData.grader,
      dateOfSubmission: formatDateForAPI(formData.dateOfSubmission),
      weighedStatus: formData.weighedStatus === "true",
      bagType: formData.bagType,
      orderDetails: [
        {
          variety: formData.variety,
          bagSizes: bagSizesWithQuantities.map((bagSize) => {
            const fieldName = getBagSizeFieldName(bagSize);
            const approxWeight = parseFloat(formData.bagApproxWeights[fieldName] || "0");
            return {
              size: bagSize,
              quantity: {
                initialQuantity: parseFloat(
                  formData.quantities[fieldName] || "0"
                ),
                currentQuantity: parseFloat(
                  formData.quantities[fieldName] || "0"
                ),
              },
              approxWeight: approxWeight > 0 ? approxWeight : undefined,
              location: getLocationForAPI(fieldName) || undefined,
            };
          }),
        },
      ],
    };

    console.log('Complete order payload:', orderData);

    createOrderMutation.mutate(orderData);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFormData((prev) => ({ ...prev, farmerName: value, farmerId: "" }));
    setShowDropdown(true);
    debouncedSearch(value);
  };

  const handleSelectFarmer = (selectedFarmer: Farmer) => {
    setFormData((prev) => ({
      ...prev,
      farmerName: selectedFarmer.name,
      farmerId: selectedFarmer._id,
    }));
    setSearchQuery(selectedFarmer.name);
    setShowDropdown(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle farmer search dropdown
      const farmerDropdown = document.getElementById("farmer-search-dropdown");
      const farmerInput = document.getElementById("farmer-search-input");
      if (
        farmerDropdown &&
        farmerInput &&
        !farmerDropdown.contains(event.target as Node) &&
        !farmerInput.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }

      // Dropdown handling is now managed by CustomSelect component
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNewFarmerSubmit = async (farmerData: NewFarmerFormData) => {
    const response = await createFarmerMutation.mutateAsync(farmerData);
    if (response.status === "Success") {
      // Create a farmer object with the new data
      const newFarmer: Farmer = {
        _id: response.data._id,
        name: response.data.name,
        address: farmerData.address,
        mobileNumber: response.data.mobileNumber,
      };
      // Update form with new farmer
      setFormData((prev) => ({
        ...prev,
        farmerName: newFarmer.name,
        farmerId: newFarmer._id,
      }));
      setSearchQuery(newFarmer.name);
      // Show the farmer details by simulating a selection
      handleSelectFarmer(newFarmer);
      setSelectedFarmer(newFarmer);
      setIsNewFarmerModalOpen(false);
    }
  };

  const clearSelectedFarmer = () => {
    setSelectedFarmer(null);
    setSearchQuery("");
    setFormData((prev) => ({
      ...prev,
      farmerName: "",
      farmerId: "",
    }));
  };

  // Add this new function to handle enter key press for quantity inputs
  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    currentBagSize: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const bagSizes = adminInfo?.preferences?.bagSizes || [];
      const currentIndex = bagSizes.indexOf(currentBagSize);
      const nextIndex = currentIndex + 1;

      // If there's a next bag size, focus its input
      if (nextIndex < bagSizes.length) {
        const nextFieldName = getBagSizeFieldName(bagSizes[nextIndex]);
        const nextInput = document.querySelector(
          `input[name="${nextFieldName}"]`
        ) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Add this new function to handle enter key press for weight inputs
  const handleWeightKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    currentBagSize: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const bagSizes = adminInfo?.preferences?.bagSizes || [];
      const currentIndex = bagSizes.indexOf(currentBagSize);
      const nextIndex = currentIndex + 1;

      // If there's a next bag size, focus its weight input
      if (nextIndex < bagSizes.length) {
        const nextFieldName = getBagSizeFieldName(bagSizes[nextIndex]);
        const nextWeightInput = document.querySelector(
          `input[name="${nextFieldName}_weight"]`
        ) as HTMLInputElement;
        if (nextWeightInput) {
          nextWeightInput.focus();
        }
      }
    }
  };

  // Handle Enter key navigation for location fields
  const handleLocationKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    bagType: string,
    currentField: keyof BagLocation
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const fieldOrder: (keyof BagLocation)[] = ["chamber", "floor", "row"];
      const currentIndex = fieldOrder.indexOf(currentField);
      const nextIndex = currentIndex + 1;

      // If there's a next field in the same bag type, focus it
      if (nextIndex < fieldOrder.length) {
        const nextField = fieldOrder[nextIndex];
        const nextInput = document.querySelector(
          `input[data-bag-type="${bagType}"][data-field="${nextField}"]`
        ) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      } else {
        // If this is the last field (row), check if there are more bag types with quantities
        const bagSizes = adminInfo?.preferences?.bagSizes || [];
        const currentBagIndex = bagSizes.findIndex((bagSize) => {
          const fieldName = getBagSizeFieldName(bagSize);
          return fieldName === bagType;
        });

        if (currentBagIndex !== -1) {
          // Find the next bag type that has quantities > 0
          let nextBagIndex = currentBagIndex + 1;
          while (nextBagIndex < bagSizes.length) {
            const nextBagFieldName = getBagSizeFieldName(
              bagSizes[nextBagIndex]
            );
            const quantity = parseFloat(
              formData.quantities[nextBagFieldName] || "0"
            );
            if (quantity > 0) {
              const nextBagChamberInput = document.querySelector(
                `input[data-bag-type="${nextBagFieldName}"][data-field="chamber"]`
              ) as HTMLInputElement;
              if (nextBagChamberInput) {
                nextBagChamberInput.focus();
                return;
              }
            }
            nextBagIndex++;
          }

          // If no more bag types with quantities, focus the remarks field
          const remarksTextarea = document.getElementById(
            "remarks-textarea"
          ) as HTMLTextAreaElement;
          if (remarksTextarea) {
            remarksTextarea.focus();
          }
        }
      }
    }
  };

  // Query for receipt number
  const { data: receiptData, isLoading: isLoadingReceipt } = useQuery({
    queryKey: ["receiptNumber", "incoming"],
    queryFn: () =>
      storeAdminApi.getReceiptNumber("incoming", adminInfo?.token || ""),
    enabled: !!adminInfo?.token,
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6 bg-background rounded-lg shadow-lg border border-border">
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
          {t("incomingOrder.title")}
        </h1>

        {/* Null Voucher Toggle */}
        <div className="mb-4 flex items-center justify-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isNullVoucher}
              onChange={(e) => {
                const isNullVoucher = e.target.checked;
                setFormData(prev => ({
                  ...prev,
                  isNullVoucher,
                  // Clear farmer data when switching to null voucher
                  farmerName: isNullVoucher ? "" : prev.farmerName,
                  farmerId: isNullVoucher ? "" : prev.farmerId,
                  // Clear variety and quantities when switching to null voucher
                  variety: isNullVoucher ? "" : prev.variety,
                  quantities: isNullVoucher ? {} : prev.quantities,
                }));
              }}
              className="w-4 h-4 text-primary border-border focus:ring-primary rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Create Null Voucher (Paper Tampered)
            </span>
          </label>
        </div>

        {/* Receipt Number Display - centered with primary color highlight */}
        <div className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-full shadow-sm">
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            GatePass No:
          </span>
          {isLoadingReceipt ? (
            <div className="h-4 w-10 animate-pulse bg-primary/20 rounded"></div>
          ) : (
            <span className="text-sm font-bold text-primary">
              #{receiptData?.receiptNumber || "-"}
            </span>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-center">
          <div className="w-[95%] sm:w-[90%] max-w-md">
            <div className="relative flex justify-between">
              {/* Line background */}
              <div className="absolute h-0.5 bg-muted top-4 sm:top-5 left-8 sm:left-10 w-[calc(100%-64px)] sm:w-[calc(100%-80px)]"></div>

              {/* Line active */}
              <div
                className={`absolute h-0.5 top-5 left-10 w-[calc(100%-80px)] transition-colors duration-500 ease-in-out ${
                  currentStep >= 2 ? "bg-primary" : "bg-muted"
                }`}
              ></div>

              {/* Step 1 */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 1
                      ? "bg-primary text-secondary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  1
                </div>
                <span className="text-xs mt-2 text-center">
                  {t("incomingOrder.steps.quantities")}
                </span>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 2
                      ? "bg-primary text-secondary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  2
                </div>
                <span className="text-xs mt-2 text-center">
                  {t("incomingOrder.steps.details")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add the modal component */}
      <NewFarmerModal
        isOpen={isNewFarmerModalOpen}
        onClose={() => setIsNewFarmerModalOpen(false)}
        onSubmit={handleNewFarmerSubmit}
        isLoading={createFarmerMutation.isPending}
        token={adminInfo?.token || ""}
      />

      <form onSubmit={handleSubmit}>
        {/* Step 1: Farmer, Variety and Quantities OR Null Voucher Details */}
        <AnimatedFormStep isVisible={currentStep === 1}>
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Null Voucher Mode */}
              {formData.isNullVoucher ? (
                <div className="space-y-6">
                  {/* Null Voucher Info */}
                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/50">
                    <h3 className="text-lg font-medium mb-2 text-orange-800">
                      Null Voucher Creation
                    </h3>
                    <p className="text-sm text-orange-700 mb-4">
                      This will create a placeholder voucher when physical paper vouchers get tampered or damaged.
                      The voucher number will be assigned but no stock will be affected.
                    </p>
                  </div>

                  {/* Remarks for Null Voucher */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Remarks (Optional)
                    </label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => updateFormData("remarks", e.target.value)}
                      placeholder="Enter reason for null voucher (e.g., 'Paper tampered', 'Voucher damaged')"
                      className="w-full p-3 border border-border rounded-md bg-background h-24 resize-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      If left empty, will default to "NULL VOUCHER - Paper tampered"
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="font-custom w-full sm:w-auto inline-block cursor-pointer rounded-lg bg-orange-600 px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold text-white no-underline duration-100 hover:bg-orange-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      Continue to Review
                    </button>
                  </div>
                </div>
              ) : (
                // Regular Order Mode
                <div className="space-y-6">
              {/* Farmer Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("incomingOrder.farmer.label")}
                </label>
                {farmer ? (
                  // Show farmer details when pre-selected
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">{farmer.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {t("incomingOrder.farmer.preSelected")}
                      </span>
                    </div>
                    {(farmer.mobileNumber || farmer.address) && (
                      <div className="text-sm text-gray-600 space-y-1">
                        {farmer.mobileNumber && (
                          <div className="flex items-center gap-2">
                            <span>📱</span>
                            <span>{farmer.mobileNumber}</span>
                          </div>
                        )}
                        {farmer.address && (
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span>{farmer.address}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Show search input when no farmer is pre-selected
                  <div className="flex gap-2 items-center relative">
                    <div className="flex-1 relative">
                      <input
                        id="farmer-search-input"
                        type="text"
                        autoComplete="off"
                        value={
                          selectedFarmer ? selectedFarmer.name : searchQuery
                        }
                        onChange={handleSearchChange}
                        onFocus={() => setShowDropdown(true)}
                        placeholder={t(
                          "incomingOrder.farmer.searchPlaceholder"
                        )}
                        className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition"
                        required
                      />
                      {selectedFarmer && (
                        <button
                          type="button"
                          onClick={clearSelectedFarmer}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                          title="Clear selection"
                        >
                          <X size={16} className="text-gray-500" />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNewFarmerModalOpen(true)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-primary text-secondary rounded-md hover:bg-primary/85 transition font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <Plus size={18} />
                      <span className="text-sm">
                        <span className="sm:hidden">Add</span>
                        <span className="hidden sm:inline">
                          {t("incomingOrder.farmer.new")}
                        </span>
                      </span>
                    </button>

                    {/* Search Results Dropdown */}
                    {showDropdown &&
                      (searchResults?.length > 0 || isSearching) && (
                        <div
                          id="farmer-search-dropdown"
                          className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-auto z-50 bg-white rounded-md shadow-lg border border-gray-200"
                        >
                          {isSearching ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : (
                            <div className="py-1">
                              {searchResults?.map((result: Farmer) => (
                                <button
                                  key={result._id}
                                  type="button"
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                  onClick={() => handleSelectFarmer(result)}
                                >
                                  <div className="font-medium">
                                    {result.name}
                                  </div>
                                  {(result.mobileNumber || result.address) && (
                                    <div className="text-sm text-gray-500">
                                      {result.mobileNumber && (
                                        <span>📱 {result.mobileNumber}</span>
                                      )}
                                      {result.address && (
                                        <span className="ml-2">
                                          📍 {result.address}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Variety Selection */}
              <VarietySelector
                value={formData.variety}
                onValueChange={(value) => updateFormData("variety", value)}
                token={adminInfo?.token || ""}
              />

              {/* Date of Submission */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Date of Submission
                </label>
                <SimpleDatePicker
                  value={formData.dateOfSubmissionDate}
                  onChange={handleDateChange}
                  placeholder="Select submission date"
                />
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Generation */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Generation
                  </label>
                  <CustomSelect
                    value={formData.generation}
                    onChange={(value) => updateFormData("generation", value)}
                    placeholder="Select Generation"
                    options={
                      bhattiData?.data?.generation?.map((gen: string) => ({
                        value: gen,
                        label: gen,
                      })) || []
                    }
                  />
                </div>

                {/* Rouging */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Rouging</label>
                  <CustomSelect
                    value={formData.rouging}
                    onChange={(value) => updateFormData("rouging", value)}
                    placeholder="Select Rouging"
                    options={
                      bhattiData?.data?.rouging?.map((rough: string) => ({
                        value: rough,
                        label: rough,
                      })) || []
                    }
                  />
                </div>

                {/* Tuber Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Tuber Type
                  </label>
                  <CustomSelect
                    value={formData.tuberType}
                    onChange={(value) => updateFormData("tuberType", value)}
                    placeholder="Select Tuber Type"
                    options={[
                      { value: "Marketable", label: "Marketable" },
                      { value: "Cut", label: "Cut" },
                    ]}
                  />
                </div>

                {/* Grader */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Grader</label>
                  <CustomSelect
                    value={formData.grader}
                    onChange={(value) => updateFormData("grader", value)}
                    placeholder="Select Grade"
                    options={
                      bhattiData?.data?.grader?.map((grade: string) => ({
                        value: grade,
                        label: grade,
                      })) || []
                    }
                  />
                </div>

                {/* Weighed Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Weighed Status
                  </label>
                  <CustomSelect
                    value={formData.weighedStatus ? "true" : "false"}
                    onChange={(value) =>
                      updateFormData("weighedStatus", value === "true")
                    }
                    placeholder="Select Status"
                    options={[
                      { value: "true", label: "Weighed" },
                      { value: "false", label: "Not Weighed" },
                    ]}
                  />
                </div>

              </div>

              {/* Bag Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">
                  Bag Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="bagType"
                      value="jute"
                      checked={formData.bagType === "jute"}
                      onChange={(e) =>
                        updateFormData("bagType", e.target.value)
                      }
                      className="w-4 h-4 text-primary border-border focus:ring-primary"
                    />
                    <span>Jute</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="bagType"
                      value="leno"
                      checked={formData.bagType === "leno"}
                      onChange={(e) =>
                        updateFormData("bagType", e.target.value)
                      }
                      className="w-4 h-4 text-primary border-border focus:ring-primary"
                    />
                    <span>Leno</span>
                  </label>
                </div>
              </div>

              {/* Quantities Section */}
              <div
                className={cn(
                  "border rounded-lg p-3 sm:p-4",
                  formData.variety
                    ? "border-green-200 bg-green-50/50"
                    : "border-muted bg-muted/5 opacity-75"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium">
                    {t("incomingOrder.quantities.title")}
                  </h3>
                  {findFirstWeight() && (
                    <button
                      type="button"
                      onClick={() => {
                        const firstWeight = findFirstWeight();
                        if (firstWeight) applyWeightToAll(firstWeight);
                      }}
                      className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      Apply First Weight to All
                    </button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {formData.variety
                    ? t("incomingOrder.quantities.description")
                    : t("incomingOrder.quantities.selectVarietyFirst")}
                </p>

                <div className="space-y-4">
                  {adminInfo?.preferences?.bagSizes?.map((bagSize) => {
                    const fieldName = getBagSizeFieldName(bagSize);

                    return (
                      <div
                        key={bagSize}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            {formatBagSizeLabel(bagSize)}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              autoComplete="off"
                              name={fieldName}
                              value={formData.quantities[fieldName] || ""}
                              onChange={(e) =>
                                updateQuantity(fieldName, e.target.value)
                              }
                              onKeyDown={(e) => handleKeyDown(e, bagSize)}
                              placeholder="Qty"
                              disabled={!formData.variety}
                              className={cn(
                                "w-20 p-2 border rounded-md bg-background text-center transition text-sm",
                                formData.variety
                                  ? "focus:ring-2 focus:ring-primary focus:border-primary"
                                  : "cursor-not-allowed"
                              )}
                            />
                            <input
                              type="text"
                              autoComplete="off"
                              name={`${fieldName}_weight`}
                              value={formData.bagApproxWeights[fieldName] || ""}
                              onChange={(e) =>
                                updateApproxWeight(fieldName, e.target.value)
                              }
                              onKeyDown={(e) => handleWeightKeyDown(e, bagSize)}
                              placeholder="Wt"
                              disabled={!formData.variety}
                              className={cn(
                                "w-20 p-2 border rounded-md bg-background text-center transition text-sm",
                                formData.variety
                                  ? "focus:ring-2 focus:ring-primary focus:border-primary"
                                  : "cursor-not-allowed"
                              )}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          Quantity / Approx Weight (kg)
                        </div>
                      </div>
                    );
                  })}

                  <hr className="border-gray-300" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-semibold">
                      <label className="text-sm">
                        {t("incomingOrder.quantities.total")}
                      </label>
                      <span
                        className={cn(
                          "text-lg",
                          !formData.variety && "text-muted-foreground"
                        )}
                      >
                        {calculateTotal()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-semibold">
                      <label className="text-sm">
                        Total Weight (kg)
                      </label>
                      <span
                        className={cn(
                          "text-lg",
                          !formData.variety && "text-muted-foreground"
                        )}
                      >
                        {calculateTotalWeight().toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="font-custom w-full sm:w-auto inline-block cursor-pointer rounded-lg bg-primary px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {t("incomingOrder.buttons.continue")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </AnimatedFormStep>

        {/* Step 2: Location and Remarks OR Null Voucher Review */}
        <AnimatedFormStep isVisible={currentStep === 2}>
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Null Voucher Review */}
              {formData.isNullVoucher ? (
                <div className="space-y-6">
                  {/* Null Voucher Summary */}
                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/50">
                    <h3 className="text-lg font-medium mb-2 text-orange-800">
                      Null Voucher Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Voucher Type:</span>
                        <span className="text-orange-700">NULL VOUCHER</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">GatePass No:</span>
                        <span className="text-orange-700">#{receiptData?.receiptNumber || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Remarks:</span>
                        <span className="text-orange-700">
                          {formData.remarks || "NULL VOUCHER - Paper tampered"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Stock Impact:</span>
                        <span className="text-orange-700">No stock affected</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="font-custom flex-1 cursor-pointer rounded-lg border border-orange-600 px-0 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition"
                      style={{ minWidth: 0 }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={createOrderMutation.isPending}
                      className="font-custom flex-1 cursor-pointer rounded-lg bg-orange-600 px-0 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition relative"
                      style={{ minWidth: 0 }}
                    >
                      {createOrderMutation.isPending ? (
                        <div className="flex items-center justify-center">
                          <Loader size="sm" className="mr-2" />
                          <span>Creating Null Voucher...</span>
                        </div>
                      ) : (
                        "Create Null Voucher"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Regular Order Mode - Location and Remarks
                <div className="space-y-6">
              {/* Location Section */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2">
                      Enter Address (CH R FL) <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      This will be used as a reference in outgoing. Leave empty if not needed.
                    </p>
                  </div>
                  {findFirstCompleteLocation() && (
                    <button
                      type="button"
                      onClick={() => {
                        const location = findFirstCompleteLocation();
                        if (location) applyLocationToAll(location);
                      }}
                      className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      Apply First Location to All
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {adminInfo?.preferences?.bagSizes?.map((bagSize) => {
                    const fieldName = getBagSizeFieldName(bagSize);
                    const quantity = parseFloat(
                      formData.quantities[fieldName] || "0"
                    );

                    // Only show location inputs for bag sizes with quantities > 0
                    if (quantity <= 0) return null;

                    return (
                      <div key={bagSize} className="space-y-3">
                        <h4 className="text-base font-bold">
                          {formatBagSizeLabel(bagSize)} - {quantity} bags
                        </h4>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Chamber
                            </label>
                            <input
                              type="text"
                              value={
                                formData.bagLocations[fieldName]?.chamber || ""
                              }
                              onChange={(e) =>
                                updateLocation(
                                  fieldName,
                                  "chamber",
                                  e.target.value
                                )
                              }
                              onKeyDown={(e) =>
                                handleLocationKeyDown(e, fieldName, "chamber")
                              }
                              data-bag-type={fieldName}
                              data-field="chamber"
                              className="w-full p-3 border border-border rounded-md bg-background text-center focus:ring-2 focus:ring-primary focus:border-primary transition disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Floor
                            </label>
                            <input
                              type="text"
                              value={
                                formData.bagLocations[fieldName]?.floor || ""
                              }
                              onChange={(e) =>
                                updateLocation(
                                  fieldName,
                                  "floor",
                                  e.target.value
                                )
                              }
                              onKeyDown={(e) =>
                                handleLocationKeyDown(e, fieldName, "floor")
                              }
                              data-bag-type={fieldName}
                              data-field="floor"
                              className="w-full p-3 border border-border rounded-md bg-background text-center focus:ring-2 focus:ring-primary focus:border-primary transition disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Row
                            </label>
                            <input
                              type="text"
                              value={
                                formData.bagLocations[fieldName]?.row || ""
                              }
                              onChange={(e) =>
                                updateLocation(fieldName, "row", e.target.value)
                              }
                              onKeyDown={(e) =>
                                handleLocationKeyDown(e, fieldName, "row")
                              }
                              data-bag-type={fieldName}
                              data-field="row"
                              className="w-full p-3 border border-border rounded-md bg-background text-center focus:ring-2 focus:ring-primary focus:border-primary transition disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-600">
                            Combined Location:{" "}
                          </span>
                          <span className="text-sm font-medium text-gray-800">
                            {getCombinedLocation(fieldName) ||
                              "Enter all fields"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remarks Section */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <h3 className="text-lg font-bold mb-2">Remarks</h3>
                <textarea
                  id="remarks-textarea"
                  value={formData.remarks}
                  onChange={(e) => updateFormData("remarks", e.target.value)}
                  placeholder="Enter any additional remarks..."
                  className="w-full p-3 border border-border rounded-md bg-background h-32 resize-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                  rows={4}
                />
              </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="font-custom flex-1 cursor-pointer rounded-lg border border-primary px-0 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-primary bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                      style={{ minWidth: 0 }}
                    >
                      {t("incomingOrder.buttons.back")}
                    </button>
                    <button
                      type="submit"
                      disabled={createOrderMutation.isPending}
                      className="font-custom flex-1 cursor-pointer rounded-lg bg-primary px-0 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-secondary hover:bg-primary/85 focus:outline-none focus:ring-2 focus:ring-primary/50 transition relative"
                      style={{ minWidth: 0 }}
                    >
                      {createOrderMutation.isPending ? (
                        <div className="flex items-center justify-center">
                          <Loader size="sm" className="mr-2" />
                          <span>{t("incomingOrder.buttons.creating")}</span>
                        </div>
                      ) : (
                        t("incomingOrder.buttons.create")
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </AnimatedFormStep>
      </form>
    </div>
  );
};

export default IncomingOrderFormContent;
