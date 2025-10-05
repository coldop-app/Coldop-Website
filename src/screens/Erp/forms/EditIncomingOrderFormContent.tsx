import React, { useState, useEffect, KeyboardEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import { RootState } from "@/store";
import { StoreAdmin, Order } from "@/utils/types";
import Loader from "@/components/common/Loader/Loader";
import VarietySelector from "@/components/common/VarietySelector/VarietySelector";
import { cn } from "@/lib/utils";
import CustomSelect from "@/components/common/CustomSelect/CustomSelect";

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
        transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), transform 500ms cubic-bezier(0.4, 0, 0.2, 1)"
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
  if (bagSize.toLowerCase() === 'number-12') return 'Number-12';
  if (bagSize.toLowerCase() === 'cut-tok') return 'Cut & Tok';
  return bagSize
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to convert bag size to field name
const getBagSizeFieldName = (bagSize: string): string => {
  // Convert from API format (e.g., "Cut-tok") to camelCase field name (e.g., "cutTok")
  const normalized = bagSize.toLowerCase().replace(/-/g, '');
  return normalized.charAt(0).toLowerCase() +
         normalized.slice(1).replace(/\b\w/g, c => c.toUpperCase());
};

interface FormData {
  farmerName: string;
  farmerId: string;
  quantities: BagQuantities;
  bagLocations: { [key: string]: BagLocation };
  remarks: string;
  variety: string;
  generation: string;
  rouging: string;
  tuberType: string;
  grader: string;
  weighedStatus: string;
  approxWeight: string;
  bagType: string;
  dateOfSubmission: string;
}

interface BagLocation {
  chamber: string;
  floor: string;
  row: string;
}

interface UpdateIncomingOrderPayload {
  remarks: string;
  dateOfSubmission: string;
  generation: string;
  rouging: string;
  tuberType: string;
  grader: string;
  weighedStatus: boolean;
  approxWeight: string;
  bagType: string;
  orderDetails: {
    variety: string;
    bagSizes: {
      size: string;
      quantity: {
        initialQuantity: number;
        currentQuantity: number;
      };
      location: string;
    }[];
  }[];
}

interface EditIncomingOrderFormContentProps {
  order: Order;
}

const EditIncomingOrderFormContent = ({ order }: EditIncomingOrderFormContentProps) => {
  const { t } = useTranslation();
  const { adminInfo } = useSelector((state: RootState) => state.auth) as { adminInfo: StoreAdmin | null };
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize form data from order
  const [formData, setFormData] = useState<FormData>(() => {
    const orderDetail = order.orderDetails[0]; // Assuming single order detail for now
    const quantities: BagQuantities = {};
    const bagLocations: { [key: string]: BagLocation } = {};

    console.log('Order details:', orderDetail);
    console.log('Bag sizes from order:', orderDetail.bagSizes);

    // Convert bag sizes to the format we need
    orderDetail.bagSizes.forEach(bag => {
      console.log('Processing bag:', bag);
      if (bag.quantity) {
        // Convert size to the correct format (e.g., 'cut-tok' to 'cutTok')
        const normalizedSize = bag.size.toLowerCase().replace(/-/g, '');
        const fieldName = normalizedSize.charAt(0).toLowerCase() +
                         normalizedSize.slice(1).replace(/\b\w/g, c => c.toUpperCase());
        console.log('Field name:', fieldName, 'Current quantity:', bag.quantity.currentQuantity);
        quantities[fieldName] = bag.quantity.currentQuantity.toString();

        // Parse location if it exists
        if (bag.location) {
          const locationParts = bag.location.split('-');
          bagLocations[fieldName] = {
            chamber: locationParts[0] || "",
            floor: locationParts[1] || "",
            row: locationParts[2] || ""
          };
        } else {
          bagLocations[fieldName] = {
            chamber: "",
            floor: "",
            row: ""
          };
        }
      }
    });

    console.log('Final quantities object:', quantities);

    return {
      farmerName: order.farmerId.name,
      farmerId: order.farmerId._id,
      quantities,
      bagLocations,
      remarks: order.remarks || "",
      variety: orderDetail.variety,
      generation: order.generation || "",
      rouging: order.rouging || "",
      tuberType: order.tuberType || "",
      grader: order.grader || "",
      weighedStatus: order.weighedStatus ? "true" : "false",
      approxWeight: order.approxWeight || "",
      bagType: order.bagType || "jute",
      dateOfSubmission: order.dateOfSubmission || new Date().toISOString().split("T")[0]
    };
  });

  // Fetch varieties
  useQuery({
    queryKey: ['varieties'],
    queryFn: () => storeAdminApi.getVarieties(adminInfo?.token || ''),
    enabled: !!adminInfo?.token,
  });

  // Query for Bhatti data
  const { data: bhattiData } = useQuery({
    queryKey: ["bhattiData"],
    queryFn: () => storeAdminApi.getBhattiData(adminInfo?.token || ""),
    enabled: !!adminInfo?.token,
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateQuantity = (bagType: string, value: string) => {
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [bagType]: numericValue
      }
    }));
  };

  const updateLocation = (
    bagType: string,
    field: keyof BagLocation,
    value: string
  ) => {
    setFormData(prev => ({
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
    return Object.values(formData.quantities)
      .reduce((sum, quantity) => sum + (parseInt(quantity) || 0), 0);
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

  const nextStep = () => {
    // Validate step 1
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
    if (!formData.approxWeight) {
      toast.error("Please enter approximate weight");
      return;
    }
    if (calculateTotal() === 0) {
      toast.error(t("incomingOrder.errors.enterQuantity"));
      return;
    }
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async () => {
      if (!adminInfo?.token) {
        throw new Error("No authentication token found");
      }

      const payload: UpdateIncomingOrderPayload = {
        remarks: formData.remarks,
        dateOfSubmission: formData.dateOfSubmission,
        generation: formData.generation,
        rouging: formData.rouging,
        tuberType: formData.tuberType,
        grader: formData.grader,
        weighedStatus: formData.weighedStatus === "true",
        approxWeight: formData.approxWeight,
        bagType: formData.bagType,
        orderDetails: [{
          variety: formData.variety,
          bagSizes: adminInfo.preferences?.bagSizes?.map(bagSize => {
            const fieldName = getBagSizeFieldName(bagSize);
            const currentQuantity = parseInt(formData.quantities[fieldName] || "0");
            return {
              size: bagSize,
              quantity: {
                initialQuantity: currentQuantity, // Set initial quantity to the same as current
                currentQuantity: currentQuantity
              },
              location: getLocationForAPI(fieldName)
            };
          }).filter(bagSize => bagSize.quantity.currentQuantity > 0) || []
        }]
      };

      // Keep the original voucher and other fields from the order
      const updatedOrder = await storeAdminApi.updateIncomingOrder(order._id, payload, adminInfo.token);

      // Return the response which should maintain the same structure
      return updatedOrder;
    },
    onSuccess: () => {
      toast.success(t('editIncomingOrder.success.orderUpdated'));
      // Force hard refresh to ensure scroll to top
      window.location.href = '/erp/daybook';
    },
    onError: (error: unknown) => {
      console.error("Error updating order:", error);
      if (error instanceof Error) {
        toast.error(error.message || t('editIncomingOrder.errors.failedToUpdate'));
      } else {
        toast.error(t('editIncomingOrder.errors.failedToUpdate'));
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateOrderMutation.mutate();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6 bg-background rounded-lg shadow-lg border border-border">
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
          {t("editIncomingOrder.title")}
        </h1>
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

      <form onSubmit={handleSubmit}>
        {/* Step 1: Farmer, Variety and Quantities */}
        <AnimatedFormStep isVisible={currentStep === 1}>
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Farmer Details (Read-only) */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <h3 className="text-lg font-medium mb-2">{t('editIncomingOrder.farmerDetails')}</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{formData.farmerName}</p>
                </div>
              </div>

              {/* Variety Selection */}
              <VarietySelector
                value={formData.variety}
                onValueChange={(value) => updateFormData("variety", value)}
                token={adminInfo?.token || ""}
              />

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
                      updateFormData("weighedStatus", value)
                    }
                    placeholder="Select Status"
                    options={[
                      { value: "true", label: "Weighed" },
                      { value: "false", label: "Not Weighed" },
                    ]}
                  />
                </div>

                {/* Approximate Weight */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Approximate Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.approxWeight}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || parseInt(value) >= 0) {
                        updateFormData("approxWeight", value);
                      }
                    }}
                    placeholder="Enter weight in kg"
                    className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:cursor-not-allowed disabled:opacity-50"
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
                  type="button"
                  onClick={nextStep}
                  className="font-custom w-full sm:w-auto inline-block cursor-pointer rounded-lg bg-primary px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                </div>

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
                  disabled={updateOrderMutation.isPending}
                  className="font-custom flex-1 cursor-pointer rounded-lg bg-primary px-0 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-secondary hover:bg-primary/85 focus:outline-none focus:ring-2 focus:ring-primary/50 transition relative"
                  style={{ minWidth: 0 }}
                >
                  {updateOrderMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <Loader size="sm" className="mr-2" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    "Edit Order"
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