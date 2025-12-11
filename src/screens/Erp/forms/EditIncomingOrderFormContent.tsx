import React, { useState, useEffect, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { storeAdminApi, UpdateIncomingOrderPayload } from "@/lib/api/storeAdmin";
import { RootState } from "@/store";
import { StoreAdmin, Order } from "@/utils/types";
import Loader from "@/components/common/Loader/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  [key: string]: string;
}

// Helper function to format bag size label
const formatBagSizeLabel = (bagSize: string): string => {
  if (bagSize.toLowerCase() === "number-12") return "Number-12";
  if (bagSize.toLowerCase() === "cut-tok") return "Cut & Tok";
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

// Helper function to parse location string into BagLocation
const parseLocationString = (location: string | undefined): BagLocation => {
  if (!location) return { chamber: "", floor: "", row: "" };
  const parts = location.trim().split("-");
  return {
    chamber: parts[0] || "",
    floor: parts[1] || "",
    row: parts[2] || "",
  };
};

interface FormData {
  farmerName: string;
  farmerId: string;
  quantities: BagQuantities;
  bagLocations: { [key: string]: BagLocation }; // Key is bag size field name
  remarks: string;
  variety: string;
}


interface EditIncomingOrderFormContentProps {
  order: Order;
}

const EditIncomingOrderFormContent = ({
  order,
}: EditIncomingOrderFormContentProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.auth) as {
    adminInfo: StoreAdmin | null;
  };
  const [currentStep, setCurrentStep] = useState(1);
  const [firstCompleteLocation, setFirstCompleteLocation] =
    useState<BagLocation | null>(null);

  // Initialize form data from order
  const [formData, setFormData] = useState<FormData>(() => {
    const orderDetail = order.orderDetails[0]; // Assuming single order detail for now
    const quantities: BagQuantities = {};
    const bagLocations: { [key: string]: BagLocation } = {};

    console.log("Order details:", orderDetail);
    console.log("Bag sizes from order:", orderDetail.bagSizes);

    // Convert bag sizes to the format we need
    orderDetail.bagSizes.forEach((bag) => {
      console.log("Processing bag:", bag);
      if (bag.quantity) {
        // Convert size to the correct format (e.g., 'cut-tok' to 'cutTok')
        const fieldName = getBagSizeFieldName(bag.size);
        console.log(
          "Field name:",
          fieldName,
          "Current quantity:",
          bag.quantity.currentQuantity
        );
        quantities[fieldName] = bag.quantity.currentQuantity.toString();

        // Parse location from bag.location or fallback to orderDetail.location
        const locationString = bag.location || orderDetail.location || "";
        bagLocations[fieldName] = parseLocationString(locationString);
      }
    });

    // Initialize locations for all bag sizes (even if they don't have quantities)
    if (adminInfo?.preferences?.bagSizes) {
      adminInfo.preferences.bagSizes.forEach((bagSize) => {
        const fieldName = getBagSizeFieldName(bagSize);
        if (!bagLocations[fieldName]) {
          bagLocations[fieldName] = {
            chamber: "",
            floor: "",
            row: "",
          };
        }
      });
    }

    console.log("Final quantities object:", quantities);
    console.log("Final bagLocations object:", bagLocations);

    return {
      farmerName: order.farmerId.name,
      farmerId: order.farmerId._id,
      quantities,
      bagLocations,
      remarks: order.remarks || "",
      variety: orderDetail.variety,
    };
  });

  // Initialize firstCompleteLocation from existing order data
  useEffect(() => {
    const orderDetail = order.orderDetails[0];
    let foundCompleteLocation: BagLocation | null = null;

    orderDetail.bagSizes.forEach((bag) => {
      if (bag.quantity) {
        const locationString = bag.location || orderDetail.location || "";
        const parsedLocation = parseLocationString(locationString);
        if (
          parsedLocation.chamber &&
          parsedLocation.floor &&
          parsedLocation.row &&
          !foundCompleteLocation
        ) {
          foundCompleteLocation = parsedLocation;
        }
      }
    });

    if (foundCompleteLocation) {
      setFirstCompleteLocation(foundCompleteLocation);
    }
  }, [order]);

  // Fetch varieties
  const { data: varietiesData, isLoading: isLoadingVarieties } = useQuery({
    queryKey: ["varieties"],
    queryFn: () => storeAdminApi.getVarieties(adminInfo?.token || ""),
    enabled: !!adminInfo?.token,
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateQuantity = (bagType: string, value: string) => {
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
        (!updatedLocation.chamber ||
          !updatedLocation.floor ||
          !updatedLocation.row)
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

      if (
        quantity > 0 &&
        location &&
        location.chamber &&
        location.floor &&
        location.row
      ) {
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
    if (!formData.variety) {
      toast.error(t("editIncomingOrder.errors.selectVariety"));
      return;
    }
    if (calculateTotal() === 0) {
      toast.error(t("editIncomingOrder.errors.enterQuantity"));
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

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async () => {
      if (!adminInfo?.token) {
        throw new Error("No authentication token found");
      }

      // Get bag sizes with quantities > 0
      const bagSizesWithQuantities =
        adminInfo.preferences?.bagSizes?.filter((bagSize) => {
          const fieldName = getBagSizeFieldName(bagSize);
          const quantity = parseInt(formData.quantities[fieldName] || "0");
          return quantity > 0;
        }) || [];

      // Get the location from the first bag size (API expects location at order detail level)
      const firstBagSizeLocation = bagSizesWithQuantities.length > 0
        ? getCombinedLocation(getBagSizeFieldName(bagSizesWithQuantities[0]))
        : "";

      const payload: UpdateIncomingOrderPayload = {
        remarks: formData.remarks,
        dateOfSubmission: order.dateOfSubmission || new Date().toISOString(), // Provide default value
        fulfilled: order.fulfilled || false,
        orderDetails: [
          {
            variety: formData.variety,
            location: firstBagSizeLocation,
            bagSizes: bagSizesWithQuantities.map((bagSize) => {
              const fieldName = getBagSizeFieldName(bagSize);
              const currentQuantity = parseInt(
                formData.quantities[fieldName] || "0"
              );
              return {
                size: bagSize,
                quantity: {
                  initialQuantity: currentQuantity, // Set initial quantity to the same as current
                  currentQuantity: currentQuantity,
                },
              };
            }),
          },
        ],
      };

      // Keep the original voucher and other fields from the order
      const updatedOrder = await storeAdminApi.updateIncomingOrder(
        order._id,
        payload,
        adminInfo.token
      );

      // Return the response which should maintain the same structure
      return updatedOrder;
    },
    onSuccess: () => {
      toast.success(t("editIncomingOrder.success.orderUpdated"));
      navigate("/erp/daybook");
    },
    onError: (error: unknown) => {
      console.error("Error updating order:", error);
      if (error instanceof Error) {
        toast.error(
          error.message || t("editIncomingOrder.errors.failedToUpdate")
        );
      } else {
        toast.error(t("editIncomingOrder.errors.failedToUpdate"));
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

    updateOrderMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background rounded-lg shadow-lg border border-border">
      <h1 className="text-2xl font-bold text-center mb-6">
        {t("editIncomingOrder.title")}
      </h1>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="w-[90%] max-w-md">
            <div className="relative flex justify-between">
              <div className="absolute h-0.5 bg-muted top-5 left-10 w-[calc(100%-80px)]"></div>
              <div
                className={`absolute h-0.5 top-5 left-10 w-[calc(100%-80px)] transition-colors duration-500 ease-in-out ${
                  currentStep >= 2 ? "bg-primary" : "bg-muted"
                }`}
              ></div>

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

      <form onSubmit={handleSubmit}>
        {/* Step 1: Farmer, Variety and Quantities */}
        <AnimatedFormStep isVisible={currentStep === 1}>
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Farmer Details (Read-only) */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <h3 className="text-lg font-medium mb-2">
                  {t("editIncomingOrder.farmerDetails")}
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">
                    {formData.farmerName}
                  </p>
                </div>
              </div>

              {/* Variety Selection */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <h3 className="text-lg font-medium mb-2">
                  {t("incomingOrder.variety.title")}
                </h3>
                <div className="relative">
                  <Select
                    value={formData.variety}
                    onValueChange={(value) => updateFormData("variety", value)}
                    disabled={isLoadingVarieties}
                  >
                    <SelectTrigger className="w-full bg-background">
                      {isLoadingVarieties ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{t("incomingOrder.variety.loading")}</span>
                        </div>
                      ) : (
                        <SelectValue
                          placeholder={t(
                            "incomingOrder.variety.selectPlaceholder"
                          )}
                        />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {varietiesData?.varieties?.map((variety: string) => (
                        <SelectItem key={variety} value={variety}>
                          {variety}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quantities Section */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <h3 className="text-lg font-medium mb-2">
                  {t("incomingOrder.quantities.title")}
                </h3>
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
                          value={formData.quantities[fieldName] || ""}
                          onChange={(e) =>
                            updateQuantity(fieldName, e.target.value)
                          }
                          placeholder="-"
                          className="w-32 p-2 border rounded-md bg-background text-center focus:ring-2 focus:ring-primary focus:border-primary transition"
                        />
                      </div>
                    );
                  })}

                  <hr className="border-gray-300" />

                  <div className="flex items-center justify-between font-semibold">
                    <label className="text-sm">
                      {t("incomingOrder.quantities.total")}
                    </label>
                    <span className="text-lg">{calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {t("editIncomingOrder.continue")}
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
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
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
                >
                  {t("editIncomingOrder.back")}
                </button>
                <button
                  type="submit"
                  disabled={updateOrderMutation.isPending}
                  className="font-custom flex-1 cursor-pointer rounded-lg bg-primary px-0 py-3 text-base font-semibold text-secondary hover:bg-primary/85 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                >
                  {updateOrderMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <Loader size="sm" className="mr-2" />
                      <span>{t("editIncomingOrder.updating")}</span>
                    </div>
                  ) : (
                    t("editIncomingOrder.update")
                  )}
                </button>
              </div>
            </div>
          )}
        </AnimatedFormStep>
      </form>
    </div>
  );
};

export default EditIncomingOrderFormContent;
