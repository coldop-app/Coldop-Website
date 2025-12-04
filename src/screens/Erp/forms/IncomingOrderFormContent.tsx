import React, { useState, useEffect, useMemo, KeyboardEvent, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Loader2, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import { RootState } from "@/store";
import { StoreAdmin } from "@/utils/types";
import Loader from "@/components/common/Loader/Loader";
import VarietySelector from "@/components/common/VarietySelector/VarietySelector";
import { cn } from "@/lib/utils";
import debounce from "lodash/debounce";
import NewFarmerModal, {
  NewFarmerFormData,
} from "@/components/modals/NewFarmerModal";
import { useWalkthrough } from "@/contexts/WalkthroughContext";
import Spotlight from "@/components/common/Spotlight/Spotlight";

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
  // Handle special cases first
  if (bagSize === "number-12") return "Number-12";
  if (bagSize === "cut-tok") return "Cut & Tok";

  // For other cases, capitalize and format
  return bagSize
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

  // Step 2
  bagLocations: { [key: string]: BagLocation }; // Key is bag size field name
  remarks: string;

  // Additional fields for API
  voucherNumber: number;
  dateOfSubmission: string;
  variety: string;
}

interface CreateOrderPayload {
  coldStorageId: string;
  farmerId: string;
  voucherNumber: number;
  dateOfSubmission: string;
  remarks: string;
  orderDetails: {
    variety: string;
    bagSizes: {
      size: string;
      quantity: {
        initialQuantity: number;
        currentQuantity: number;
      };
      location: string; // Each bag size now has its own location
    }[];
  }[];
}

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
  const navigate = useNavigate();
  const location = useLocation();
  const farmer = location.state?.farmer as Farmer | undefined;
  const { adminInfo } = useSelector((state: RootState) => state.auth) as {
    adminInfo: StoreAdmin | null;
  };
  const { currentStep: walkthroughStep, nextStep: nextWalkthroughStep, isActive: isWalkthroughActive } = useWalkthrough();

  // Use ref to track walkthrough state for mutation callbacks
  const walkthroughStepRef = useRef(walkthroughStep);
  const isWalkthroughActiveRef = useRef(isWalkthroughActive);

  // Update refs when walkthrough state changes
  useEffect(() => {
    walkthroughStepRef.current = walkthroughStep;
    isWalkthroughActiveRef.current = isWalkthroughActive;
  }, [walkthroughStep, isWalkthroughActive]);

  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNewFarmerModalOpen, setIsNewFarmerModalOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [firstCompleteLocation, setFirstCompleteLocation] =
    useState<BagLocation | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [formData, setFormData] = useState<FormData>({
    farmerName: farmer?.name || "",
    farmerId: farmer?._id || "",
    quantities: {},
    bagLocations: {},
    remarks: "",
    voucherNumber: 0,
    dateOfSubmission: new Date().toISOString().split("T")[0],
    variety: "",
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

  // Initialize quantities and locations based on admin preferences
  useEffect(() => {
    if (adminInfo?.preferences?.bagSizes) {
      const initialQuantities: BagQuantities = {};
      const initialLocations: { [key: string]: BagLocation } = {};

      adminInfo.preferences.bagSizes.forEach((bagSize) => {
        const fieldName = getBagSizeFieldName(bagSize);
        initialQuantities[fieldName] = "";
        initialLocations[fieldName] = {
          chamber: "",
          floor: "",
          row: "",
        };
      });

      setFormData((prev) => ({
        ...prev,
        quantities: initialQuantities,
        bagLocations: initialLocations,
      }));
    }
  }, [adminInfo?.preferences?.bagSizes]);

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

  // Auto-focus on farmer search input when component mounts
  useEffect(() => {
    if (!farmer) {
      const timer = setTimeout(() => {
        const farmerInput = document.getElementById("farmer-search-input");
        if (farmerInput) {
          (farmerInput as HTMLInputElement).focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [farmer]);

  // Add global keydown listener for variety selector
  useEffect(() => {
    const handleVarietyKeyDown = (e: Event) => {
      const keyboardEvent = e as unknown as KeyboardEvent;
      const target = keyboardEvent.target as HTMLElement;
      if (target.id === "variety-search-input" && keyboardEvent.key === "Enter") {
        keyboardEvent.preventDefault();
        // Focus on first bag quantity input
        const bagSizes = adminInfo?.preferences?.bagSizes || [];
        if (bagSizes.length > 0) {
          const firstBagFieldName = getBagSizeFieldName(bagSizes[0]);
          const firstQuantityInput = document.querySelector(
            `input[name="${firstBagFieldName}"]`
          ) as HTMLInputElement;
          if (firstQuantityInput) {
            firstQuantityInput.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleVarietyKeyDown);
    return () => document.removeEventListener("keydown", handleVarietyKeyDown);
  }, [adminInfo?.preferences?.bagSizes]);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateQuantity = (bagType: string, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [bagType]: numericValue,
      },
    }));
  };

  const updateLocation = (
    bagType: string,
    field: keyof BagLocation,
    value: string
  ) => {
    setFormData((prev) => {
      const newBagLocations = {
        ...prev.bagLocations,
        [bagType]: {
          ...prev.bagLocations[bagType],
          [field]: value,
        },
      };

      // Check if this location is now complete and update first complete location
      const updatedLocation = newBagLocations[bagType];
      if (
        updatedLocation &&
        updatedLocation.chamber &&
        updatedLocation.floor &&
        updatedLocation.row
      ) {
        // Always update firstCompleteLocation when a complete location is found
        setFirstCompleteLocation(updatedLocation);
      } else if (
        updatedLocation &&
        (!updatedLocation.chamber || !updatedLocation.floor || !updatedLocation.row)
      ) {
        // If location becomes incomplete, clear firstCompleteLocation
        setFirstCompleteLocation(null);
      }

      return {
        ...prev,
        bagLocations: newBagLocations,
      };
    });
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

  const clearAllLocations = () => {
    const bagSizes = adminInfo?.preferences?.bagSizes || [];
    const newBagLocations = { ...formData.bagLocations };

    // Clear all locations for bag sizes with quantities > 0
    bagSizes.forEach((bagSize) => {
      const fieldName = getBagSizeFieldName(bagSize);
      const quantity = parseInt(formData.quantities[fieldName] || "0");

      if (quantity > 0) {
        newBagLocations[fieldName] = {
          chamber: "",
          floor: "",
          row: "",
        };
      }
    });

    setFormData((prev) => ({
      ...prev,
      bagLocations: newBagLocations,
    }));

    setFirstCompleteLocation(null);
    toast.success("All locations cleared!");
  };

  const applyLocationToAll = () => {
    // Find the most recent complete location from all bag locations
    const bagSizes = adminInfo?.preferences?.bagSizes || [];
    let mostRecentCompleteLocation: BagLocation | null = null;

    // Look for the most recent complete location
    for (const bagSize of bagSizes) {
      const fieldName = getBagSizeFieldName(bagSize);
      const location = formData.bagLocations[fieldName];
      const quantity = parseInt(formData.quantities[fieldName] || "0");

      if (quantity > 0 && location && location.chamber && location.floor && location.row) {
        mostRecentCompleteLocation = location;
      }
    }

    if (!mostRecentCompleteLocation) {
      toast.error("Please complete at least one location first!");
      return;
    }

    const newBagLocations = { ...formData.bagLocations };

    // Apply the most recent complete location to all bag sizes that have quantities > 0
    bagSizes.forEach((bagSize) => {
      const fieldName = getBagSizeFieldName(bagSize);
      const quantity = parseInt(formData.quantities[fieldName] || "0");

      if (quantity > 0) {
        newBagLocations[fieldName] = { ...mostRecentCompleteLocation };
      }
    });

    setFormData((prev) => ({
      ...prev,
      bagLocations: newBagLocations,
    }));

    // Update firstCompleteLocation to the applied location
    setFirstCompleteLocation(mostRecentCompleteLocation);

    toast.success("Location applied to all bag sizes!");

    // Advance walkthrough to create button step if active
    if (isWalkthroughActive && walkthroughStep === 'incoming-enter-location') {
      setTimeout(() => {
        nextWalkthroughStep();
      }, 100);
    }

    // Focus on remarks field after applying location to all
    setTimeout(() => {
      const remarksTextarea = document.getElementById("remarks-textarea");
      if (remarksTextarea) {
        (remarksTextarea as HTMLTextAreaElement).focus();
      }
    }, 100);
  };

  const calculateTotal = () => {
    return Object.values(formData.quantities).reduce(
      (sum, quantity) => sum + (parseInt(quantity) || 0),
      0
    );
  };

  const nextStep = () => {
    // Validate step 1
    if (!formData.farmerName.trim()) {
      toast.error(t("incomingOrder.errors.enterFarmerName"));
      return;
    }
    if (!formData.variety) {
      toast.error(t("incomingOrder.errors.selectVariety"));
      return;
    }
    if (calculateTotal() === 0) {
      toast.error(t("incomingOrder.errors.enterQuantity"));
      return;
    }
    setCurrentStep(2);
    // Scroll to top when moving to step 2 - use setTimeout to ensure DOM update
    setTimeout(() => {
      // Try multiple scroll methods to ensure it works
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Alternative method using scrollIntoView
      const formElement = document.querySelector(".max-w-2xl");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);

    // Focus on the first location input after scrolling is complete
    setTimeout(() => {
      const bagSizes = adminInfo?.preferences?.bagSizes || [];
      for (const bagSize of bagSizes) {
        const fieldName = getBagSizeFieldName(bagSize);
        const quantity = parseInt(formData.quantities[fieldName] || "0");

        if (quantity > 0) {
          const firstChamberInput = document.querySelector(
            `input[data-bag-type="${fieldName}"][data-field="chamber"]`
          ) as HTMLInputElement;
          if (firstChamberInput) {
            firstChamberInput.focus();
            break;
          }
        }
      }
    }, 300); // Separate timeout for focus to ensure scroll completes first
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  // Create incoming order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderPayload) => {
      if (!adminInfo?.token) {
        throw new Error("No authentication token found");
      }
      return storeAdminApi.createIncomingOrder(orderData, adminInfo.token);
    },
    onSuccess: () => {
      toast.success(t("incomingOrder.success.orderCreated"));
      // Reset form
      setFormData({
        farmerName: "",
        farmerId: "",
        quantities: {},
        bagLocations: {},
        remarks: "",
        voucherNumber: 0,
        dateOfSubmission: new Date().toISOString().split("T")[0],
        variety: "",
      });
      setCurrentStep(1);
      // Navigate back or to orders list
      navigate("/erp/daybook");
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
      // Advance to next walkthrough step if active
      // Use refs to get current values in callback
      if (isWalkthroughActiveRef.current && walkthroughStepRef.current === 'incoming-add-farmer') {
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          nextWalkthroughStep();
        }, 100);
      }
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

    // Validate step 2 - check that all bag sizes with quantities have complete locations
    const bagSizesWithQuantities =
      adminInfo?.preferences?.bagSizes?.filter((bagSize) => {
        const fieldName = getBagSizeFieldName(bagSize);
        const quantity = parseInt(formData.quantities[fieldName] || "0");
        return quantity > 0;
      }) || [];

    for (const bagSize of bagSizesWithQuantities) {
      const fieldName = getBagSizeFieldName(bagSize);
      const location = formData.bagLocations[fieldName];
      if (!location || !location.chamber || !location.floor || !location.row) {
        toast.error(t("incomingOrder.errors.enterLocationForAllBags"));
        return;
      }
    }

    // Use the receipt number from our query
    const voucherNumber = receiptData?.receiptNumber || 1;

    // Prepare order data according to API structure
    const orderData: CreateOrderPayload = {
      coldStorageId: adminInfo?._id || "",
      farmerId: formData.farmerId || "temp-farmer-id",
      voucherNumber: voucherNumber,
      dateOfSubmission: formData.dateOfSubmission,
      remarks: formData.remarks,
      orderDetails: [
        {
          variety: formData.variety,
          bagSizes: bagSizesWithQuantities.map((bagSize) => {
            const fieldName = getBagSizeFieldName(bagSize);
            return {
              size: bagSize,
              quantity: {
                initialQuantity: parseInt(
                  formData.quantities[fieldName] || "0"
                ),
                currentQuantity: parseInt(
                  formData.quantities[fieldName] || "0"
                ),
              },
              location: getCombinedLocation(fieldName),
            };
          }),
        },
      ],
    };

    createOrderMutation.mutate(orderData);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFormData((prev) => ({ ...prev, farmerName: value, farmerId: "" }));
    setShowDropdown(true);
    setHighlightedIndex(-1); // Reset highlighted index when search changes
    debouncedSearch(value);
  };

  // Auto-highlight first result when search results change
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      setHighlightedIndex(0); // Auto-highlight first result
    } else {
      setHighlightedIndex(-1);
    }
  }, [searchResults]);

  // Handle keyboard navigation for farmer search dropdown
  const handleFarmerSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const results = searchResults || [];

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowDropdown(true);
      setHighlightedIndex(prev =>
        prev < results.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setShowDropdown(true);
      setHighlightedIndex(prev =>
        prev > 0 ? prev - 1 : results.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0) {
        // Select the highlighted farmer or first result if none highlighted
        const selectedIndex = highlightedIndex >= 0 ? highlightedIndex : 0;
        handleSelectFarmer(results[selectedIndex]);
      } else {
        // If no results, focus on variety selector
        const varietyInput = document.getElementById("variety-search-input");
        if (varietyInput) {
          (varietyInput as HTMLInputElement).focus();
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };


  const handleSelectFarmer = (selectedFarmer: Farmer) => {
    setFormData((prev) => ({
      ...prev,
      farmerName: selectedFarmer.name,
      farmerId: selectedFarmer._id,
    }));
    setSearchQuery(selectedFarmer.name);
    setShowDropdown(false);
    setHighlightedIndex(-1);

    // Focus on variety selector after farmer selection
    setTimeout(() => {
      const varietyInput = document.getElementById("variety-search-input");
      if (varietyInput) {
        (varietyInput as HTMLInputElement).focus();
      }
    }, 100);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById("farmer-search-dropdown");
      const input = document.getElementById("farmer-search-input");
      if (
        dropdown &&
        input &&
        !dropdown.contains(event.target as Node) &&
        !input.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
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
      // Advance to next walkthrough step if active
      // Use refs to get current values in callback
      if (isWalkthroughActiveRef.current && walkthroughStepRef.current === 'incoming-add-farmer') {
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          nextWalkthroughStep();
        }, 100);
      }
    }
  };

  const clearSelectedFarmer = () => {
    setSelectedFarmer(null);
    setSearchQuery("");
    setHighlightedIndex(-1);
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
      } else {
        // If this is the last bag size, focus on the continue button
        const continueButton = document.getElementById("continue-button");
        if (continueButton) {
          (continueButton as HTMLButtonElement).focus();
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
            const quantity = parseInt(
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

  // Scroll to add farmer button or modal when walkthrough step is active
  useEffect(() => {
    if (walkthroughStep === 'incoming-add-farmer') {
      // Wait for component to render
      const timer = setTimeout(() => {
        if (isNewFarmerModalOpen) {
          // If modal is open, scroll to modal
          const modal = document.getElementById('new-farmer-modal');
          if (modal) {
            modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          // Otherwise scroll to button
          const button = document.getElementById('add-farmer-button');
          if (button) {
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [walkthroughStep, isNewFarmerModalOpen]);

  // Scroll to variety selector when walkthrough step is active
  useEffect(() => {
    if (walkthroughStep === 'incoming-select-variety') {
      // Wait for component to render
      const timer = setTimeout(() => {
        const varietySection = document.getElementById('variety-selector-section');
        if (varietySection) {
          varietySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [walkthroughStep]);

  // Scroll to quantities section when walkthrough step is active
  useEffect(() => {
    if (walkthroughStep === 'incoming-enter-quantities') {
      // Wait for component to render
      const timer = setTimeout(() => {
        const quantitiesSection = document.getElementById('quantities-section');
        if (quantitiesSection) {
          quantitiesSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [walkthroughStep]);

  // Scroll to location section when walkthrough step is active
  useEffect(() => {
    if (walkthroughStep === 'incoming-enter-location') {
      // Wait for component to render
      const timer = setTimeout(() => {
        const locationSection = document.getElementById('location-section');
        if (locationSection) {
          locationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [walkthroughStep]);

  // Scroll to create button when walkthrough step is active
  useEffect(() => {
    if (walkthroughStep === 'incoming-create-button' && currentStep === 2) {
      // Wait for component to render
      const timer = setTimeout(() => {
        const createButton = document.getElementById('create-incoming-order-button');
        if (createButton) {
          createButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [walkthroughStep, currentStep]);

  // Check if all locations are complete and focus on remarks
  useEffect(() => {
    if (currentStep !== 2) return; // Only check when on step 2

    const bagSizes = adminInfo?.preferences?.bagSizes || [];
    const bagSizesWithQuantities = bagSizes.filter((bagSize) => {
      const fieldName = getBagSizeFieldName(bagSize);
      const quantity = parseInt(formData.quantities[fieldName] || "0");
      return quantity > 0;
    });

    if (bagSizesWithQuantities.length === 0) return;

    const allLocationsComplete = bagSizesWithQuantities.every((bagSize) => {
      const fieldName = getBagSizeFieldName(bagSize);
      const location = formData.bagLocations[fieldName];
      return (
        location &&
        location.chamber &&
        location.floor &&
        location.row
      );
    });

    // If all locations are complete, focus on remarks field
    if (allLocationsComplete) {
      const timer = setTimeout(() => {
        const remarksTextarea = document.getElementById("remarks-textarea");
        if (remarksTextarea) {
          (remarksTextarea as HTMLTextAreaElement).focus();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [formData.bagLocations, formData.quantities, currentStep, adminInfo?.preferences?.bagSizes]);

  return (
    <>
      <Spotlight
        instruction={isNewFarmerModalOpen ? "Fill in the farmer details and click 'Add Farmer' to create a new account." : "Add a new farmer account"}
        targetId={isNewFarmerModalOpen ? "new-farmer-modal" : "add-farmer-button"}
        isActive={walkthroughStep === 'incoming-add-farmer'}
      />
      <Spotlight
        instruction="Choose the potato variety for this voucher. You can edit the variety list later in settings."
        targetId="variety-selector-section"
        isActive={walkthroughStep === 'incoming-select-variety'}
      />
      <Spotlight
        instruction="Enter the number of bags for each bag size below."
        targetId="quantities-section"
        isActive={walkthroughStep === 'incoming-enter-quantities'}
      />
      <Spotlight
        instruction="Enter the storage location (Chamber, Floor, Row) for each bag size. You can apply one location to all bag sizes using the 'Apply to All' button."
        targetId="location-section"
        isActive={walkthroughStep === 'incoming-enter-location' && currentStep === 2}
      />
      <Spotlight
        instruction="Click 'Apply to All' to quickly apply the same location to all bag sizes instead of typing each one."
        targetId="apply-to-all-button"
        isActive={walkthroughStep === 'incoming-enter-location' && currentStep === 2 && !!firstCompleteLocation}
      />
      <Spotlight
        instruction="Click 'Create Incoming Order' to submit the form and create your receipt voucher. You can add optional remarks before submitting."
        targetId="create-incoming-order-button"
        isActive={walkthroughStep === 'incoming-create-button' && currentStep === 2}
      />
      <div className="max-w-2xl mx-auto p-6 bg-background rounded-lg shadow-lg border border-border">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-3">{t("incomingOrder.title")}</h1>

        {/* Receipt Number Display - centered with primary color highlight */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full shadow-sm">
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            {t("voucher no:")}
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
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="w-[90%] max-w-md">
            <div className="relative flex justify-between">
              {/* Line background */}
              <div className="absolute h-0.5 bg-muted top-5 left-10 w-[calc(100%-80px)]"></div>

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
        {/* Step 1: Farmer, Variety and Quantities */}
        <AnimatedFormStep isVisible={currentStep === 1}>
          {currentStep === 1 && (
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
                  <div className="flex gap-2 items-center relative z-[10000]">
                    <div className="flex-1 relative">
                      <input
                        id="farmer-search-input"
                        type="text"
                        autoComplete="off"
                        value={
                          selectedFarmer ? selectedFarmer.name : searchQuery
                        }
                        onChange={handleSearchChange}
                        onKeyDown={handleFarmerSearchKeyDown}
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
                      id="add-farmer-button"
                      type="button"
                      onClick={() => {
                        setIsNewFarmerModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-3 bg-primary text-secondary rounded-md hover:bg-primary/85 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 relative"
                    >
                      <Plus size={18} />
                      <span className="text-sm">
                        {t("incomingOrder.farmer.new")}
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
                              {searchResults?.map((result: Farmer, index: number) => (
                                <button
                                  key={result._id}
                                  type="button"
                                  className={`w-full text-left px-4 py-2 focus:outline-none transition-colors ${
                                    index === highlightedIndex
                                      ? "bg-gray-100 text-gray-800 border-l-2 border-gray-400"
                                      : "hover:bg-gray-50 focus:bg-gray-50"
                                  }`}
                                  onClick={() => handleSelectFarmer(result)}
                                >
                                  <div className="font-medium">
                                    {result.name}
                                  </div>
                                  {(result.mobileNumber || result.address) && (
                                    <div className={`text-sm ${
                                      index === highlightedIndex ? "text-gray-600" : "text-gray-500"
                                    }`}>
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
                onValueChange={(value) => {
                  updateFormData("variety", value);
                  // Advance to next walkthrough step when variety is selected
                  if (walkthroughStep === 'incoming-select-variety' && value) {
                    setTimeout(() => {
                      nextWalkthroughStep();
                    }, 100);
                  }
                }}
                token={adminInfo?.token || ""}
              />

              {/* Quantities Section */}
              <div
                id="quantities-section"
                className={cn(
                  "border rounded-lg p-4",
                  formData.variety
                    ? "border-green-200 bg-green-50/50"
                    : "border-muted bg-muted/5 opacity-75"
                )}
              >
                <h3 className="text-lg font-medium mb-2">
                  {t("incomingOrder.quantities.title")}
                </h3>
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
                        className="flex items-center justify-between"
                      >
                        <label className="text-sm font-medium">
                          {formatBagSizeLabel(bagSize)}
                        </label>
                        <input
                          type="text"
                          autoComplete="off"
                          name={fieldName}
                          value={formData.quantities[fieldName] || ""}
                          onChange={(e) =>
                            updateQuantity(fieldName, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, bagSize)}
                          placeholder="-"
                          disabled={!formData.variety}
                          className={cn(
                            "w-32 p-2 border rounded-md bg-background text-center transition",
                            formData.variety
                              ? "focus:ring-2 focus:ring-primary focus:border-primary"
                              : "cursor-not-allowed"
                          )}
                        />
                      </div>
                    );
                  })}

                  <hr className="border-gray-300" />

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
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  id="continue-button"
                  type="button"
                  onClick={() => {
                    // Advance to location step when continuing from quantities
                    if (walkthroughStep === 'incoming-enter-quantities') {
                      setTimeout(() => {
                        nextWalkthroughStep();
                      }, 100);
                    }
                    nextStep();
                  }}
                  className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {t("incomingOrder.buttons.continue")}
                </button>
              </div>
            </div>
          )}
        </AnimatedFormStep>

        {/* Step 2: Location and Remarks */}
        <AnimatedFormStep isVisible={currentStep === 2}>
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Location Section */}
              <div id="location-section" className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">Enter Address (CH R FL)</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={clearAllLocations}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/50"
                    >
                      Clear All
                    </button>
                    {firstCompleteLocation && (
                      <button
                        id="apply-to-all-button"
                        type="button"
                        onClick={applyLocationToAll}
                        className="px-4 py-2 bg-primary text-secondary rounded-md hover:bg-primary/85 transition font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        Apply to All
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  This will be used as a reference in outgoing.
                </p>

                <div className="space-y-6">
                  {adminInfo?.preferences?.bagSizes?.map((bagSize) => {
                    const fieldName = getBagSizeFieldName(bagSize);
                    const quantity = parseInt(
                      formData.quantities[fieldName] || "0"
                    );

                    // Only show location inputs for bag sizes with quantities > 0
                    if (quantity === 0) return null;

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
                              className="w-full p-2 border border-gray-300 rounded-md bg-white text-center focus:ring-2 focus:ring-primary focus:border-primary transition"
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
                              className="w-full p-2 border border-gray-300 rounded-md bg-white text-center focus:ring-2 focus:ring-primary focus:border-primary transition"
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
                              className="w-full p-2 border border-gray-300 rounded-md bg-white text-center focus:ring-2 focus:ring-primary focus:border-primary transition"
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
                  className="font-custom flex-1 cursor-pointer rounded-lg border border-primary px-0 py-3 text-base font-medium text-primary bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  style={{ minWidth: 0 }}
                >
                  {t("incomingOrder.buttons.back")}
                </button>
                <button
                  id="create-incoming-order-button"
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  onClick={() => {
                    // Advance to voucher explanation step when submitting the form
                    if ((walkthroughStep === 'incoming-create-button' || walkthroughStep === 'incoming-enter-location') && isWalkthroughActive) {
                      nextWalkthroughStep();
                    }
                  }}
                  className="font-custom flex-1 cursor-pointer rounded-lg bg-primary px-0 py-3 text-base font-semibold text-secondary hover:bg-primary/85 focus:outline-none focus:ring-2 focus:ring-primary/50 transition relative"
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
        </AnimatedFormStep>
      </form>
    </div>
    </>
  );
};

export default IncomingOrderFormContent;
