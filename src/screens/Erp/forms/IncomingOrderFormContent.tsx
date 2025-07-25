import React, { useState, useEffect, useCallback, KeyboardEvent } from "react";
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
import NewFarmerModal, { NewFarmerFormData } from "@/components/modals/NewFarmerModal";

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
  [key: string]: string;  // Make it an index signature to accept any string key
}

// Helper function to format bag size label
const formatBagSizeLabel = (bagSize: string): string => {
  // Handle special cases first
  if (bagSize === 'number-12') return 'Number-12';
  if (bagSize === 'cut-tok') return 'Cut & Tok';

  // For other cases, capitalize and format
  return bagSize
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to convert bag size to field name
const getBagSizeFieldName = (bagSize: string): string => {
  // Convert from kebab-case to camelCase
  return bagSize.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

interface FormData {
  // Step 1
  farmerName: string;
  farmerId: string;
  quantities: BagQuantities;

  // Step 2
  mainLocation: string;
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
    }[];
    location: string;
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
  const { adminInfo } = useSelector((state: RootState) => state.auth) as { adminInfo: StoreAdmin | null };

  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNewFarmerModalOpen, setIsNewFarmerModalOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);

  const [formData, setFormData] = useState<FormData>({
    farmerName: farmer?.name || "",
    farmerId: farmer?._id || "",
    quantities: {},
    mainLocation: "",
    remarks: "",
    voucherNumber: 0,
    dateOfSubmission: new Date().toISOString().split('T')[0],
    variety: ""
  });

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length >= 2) {
        refetch();
      }
    }, 300),
    []
  );

  // Farmer search query
  const { data: searchResults, isLoading: isSearching, refetch } = useQuery({
    queryKey: ['searchFarmers', searchQuery],
    queryFn: () => storeAdminApi.searchFarmers(adminInfo?._id || '', searchQuery, adminInfo?.token || ''),
    enabled: false, // We'll manually trigger this with the debounced function
  });

  // Initialize quantities based on admin preferences
  useEffect(() => {
    if (adminInfo?.preferences?.bagSizes) {
      const initialQuantities: BagQuantities = {};
      adminInfo.preferences.bagSizes.forEach(bagSize => {
        const fieldName = getBagSizeFieldName(bagSize);
        initialQuantities[fieldName] = "";
      });
      setFormData(prev => ({
        ...prev,
        quantities: initialQuantities
      }));
    }
  }, [adminInfo?.preferences?.bagSizes]);

  // Add useEffect to update form when farmer changes
  useEffect(() => {
    if (farmer) {
      setFormData(prev => ({
        ...prev,
        farmerName: farmer.name,
        farmerId: farmer._id
      }));
    }
  }, [farmer]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateQuantity = (bagType: string, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [bagType]: numericValue
      }
    }));
  };

  const calculateTotal = () => {
    return Object.values(formData.quantities)
      .reduce((sum, quantity) => sum + (parseInt(quantity) || 0), 0);
  };

  const nextStep = () => {
    // Validate step 1
    if (!formData.farmerName.trim()) {
      toast.error(t('incomingOrder.errors.enterFarmerName'));
      return;
    }
    if (!formData.variety) {
      toast.error(t('incomingOrder.errors.selectVariety'));
      return;
    }
    if (calculateTotal() === 0) {
      toast.error(t('incomingOrder.errors.enterQuantity'));
      return;
    }
    setCurrentStep(2);
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
      toast.success(t('incomingOrder.success.orderCreated'));
      // Reset form
      setFormData({
        farmerName: "",
        farmerId: "",
        quantities: {},
        mainLocation: "",
        remarks: "",
        voucherNumber: 0,
        dateOfSubmission: new Date().toISOString().split('T')[0],
        variety: ""
      });
      setCurrentStep(1);
      // Navigate back or to orders list
      navigate('/erp/daybook');
    },
    onError: (error: unknown) => {
      console.error("Error creating order:", error);
      if (error instanceof Error) {
        const apiError = error as ApiError;
        toast.error(apiError.response?.data?.message || t('incomingOrder.errors.failedToCreate'));
      } else {
        toast.error(t('incomingOrder.errors.failedToCreate'));
      }
    }
  });

  // Create farmer mutation
  const createFarmerMutation = useMutation({
    mutationFn: async (farmerData: NewFarmerFormData) => {
      if (!adminInfo?.token) {
        throw new Error("No authentication token found");
      }
      return storeAdminApi.quickRegister({
        name: farmerData.name,
        address: farmerData.address,
        mobileNumber: farmerData.contact,
        password: "123456", // Hardcoded default password
        imageUrl: "",
        farmerId: farmerData.accNo
      }, adminInfo.token);
    },
    onSuccess: (data) => {
      toast.success(t('incomingOrder.success.farmerCreated'));
      // Create a farmer object with the new data
      const newFarmer: Farmer = {
        _id: data.data._id,
        name: data.data.name,
        address: data.data.address || "",
        mobileNumber: data.data.mobileNumber
      };
      // Update form with new farmer
      setFormData(prev => ({
        ...prev,
        farmerName: newFarmer.name,
        farmerId: newFarmer._id
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
        toast.error(apiError.response?.data?.message || t('incomingOrder.errors.failedToCreateFarmer'));
      } else {
        toast.error(t('incomingOrder.errors.failedToCreateFarmer'));
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate step 2
    if (!formData.mainLocation.trim()) {
      toast.error(t('incomingOrder.errors.enterLocation'));
      return;
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
          bagSizes: adminInfo?.preferences?.bagSizes?.map(bagSize => ({
            size: bagSize,
            quantity: {
              initialQuantity: parseInt(formData.quantities[getBagSizeFieldName(bagSize)] || "0"),
              currentQuantity: parseInt(formData.quantities[getBagSizeFieldName(bagSize)] || "0")
            }
          })).filter(bagSize => bagSize.quantity.initialQuantity > 0) || [],
          location: formData.mainLocation
        }
      ]
    };

    createOrderMutation.mutate(orderData);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFormData(prev => ({ ...prev, farmerName: value, farmerId: '' }));
    setShowDropdown(true);
    debouncedSearch(value);
  };

  const handleSelectFarmer = (selectedFarmer: Farmer) => {
    setFormData(prev => ({
      ...prev,
      farmerName: selectedFarmer.name,
      farmerId: selectedFarmer._id
    }));
    setSearchQuery(selectedFarmer.name);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('farmer-search-dropdown');
      const input = document.getElementById('farmer-search-input');
      if (dropdown && input && !dropdown.contains(event.target as Node) && !input.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewFarmerSubmit = async (farmerData: NewFarmerFormData) => {
    const response = await createFarmerMutation.mutateAsync(farmerData);
    if (response.status === "Success") {
      // Create a farmer object with the new data
      const newFarmer: Farmer = {
        _id: response.data._id,
        name: response.data.name,
        address: farmerData.address,
        mobileNumber: response.data.mobileNumber
      };
      // Update form with new farmer
      setFormData(prev => ({
        ...prev,
        farmerName: newFarmer.name,
        farmerId: newFarmer._id
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
    setFormData(prev => ({
      ...prev,
      farmerName: "",
      farmerId: ""
    }));
  };

  // Add this new function to handle enter key press
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, currentBagSize: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const bagSizes = adminInfo?.preferences?.bagSizes || [];
      const currentIndex = bagSizes.indexOf(currentBagSize);
      const nextIndex = currentIndex + 1;

      // If there's a next bag size, focus its input
      if (nextIndex < bagSizes.length) {
        const nextFieldName = getBagSizeFieldName(bagSizes[nextIndex]);
        const nextInput = document.querySelector(`input[name="${nextFieldName}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Query for receipt number
  const { data: receiptData, isLoading: isLoadingReceipt } = useQuery({
    queryKey: ['receiptNumber', 'incoming'],
    queryFn: () => storeAdminApi.getReceiptNumber('incoming', adminInfo?.token || ''),
    enabled: !!adminInfo?.token,
  });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background rounded-lg shadow-lg border border-border">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-3">{t('incomingOrder.title')}</h1>
        
        {/* Receipt Number Display - centered with primary color highlight */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full shadow-sm">
          <span className="text-xs font-medium text-primary uppercase tracking-wide">{t('voucher no:')}</span>
          {isLoadingReceipt ? (
            <div className="h-4 w-10 animate-pulse bg-primary/20 rounded"></div>
          ) : (
            <span className="text-sm font-bold text-primary">#{receiptData?.receiptNumber || '-'}</span>
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
                  currentStep >= 2 ? 'bg-primary' : 'bg-muted'
                }`}
              ></div>

              {/* Step 1 */}
              <div className="relative flex flex-col items-center">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'
                }`}>
                  1
                </div>
                <span className="text-xs mt-2 text-center">{t('incomingOrder.steps.quantities')}</span>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <span className="text-xs mt-2 text-center">{t('incomingOrder.steps.details')}</span>
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
        token={adminInfo?.token || ''}
      />

      <form onSubmit={handleSubmit}>
        {/* Step 1: Farmer, Variety and Quantities */}
        <AnimatedFormStep isVisible={currentStep === 1}>
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Farmer Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('incomingOrder.farmer.label')}
                </label>
                {farmer ? (
                  // Show farmer details when pre-selected
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">{farmer.name}</h3>
                      <span className="text-sm text-muted-foreground">{t('incomingOrder.farmer.preSelected')}</span>
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
                        value={selectedFarmer ? selectedFarmer.name : searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => setShowDropdown(true)}
                        placeholder={t('incomingOrder.farmer.searchPlaceholder')}
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
                      className="flex items-center gap-2 px-4 py-3 bg-primary text-secondary rounded-md hover:bg-primary/85 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <Plus size={18} />
                      <span className="text-sm">{t('incomingOrder.farmer.new')}</span>
                    </button>

                    {/* Search Results Dropdown */}
                    {showDropdown && (searchResults?.length > 0 || isSearching) && (
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
                                <div className="font-medium">{result.name}</div>
                                {(result.mobileNumber || result.address) && (
                                  <div className="text-sm text-gray-500">
                                    {result.mobileNumber && <span>📱 {result.mobileNumber}</span>}
                                    {result.address && <span className="ml-2">📍 {result.address}</span>}
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
                onValueChange={(value) => updateFormData('variety', value)}
                token={adminInfo?.token || ''}
              />

              {/* Quantities Section */}
              <div className={cn(
                "border rounded-lg p-4",
                formData.variety
                  ? "border-green-200 bg-green-50/50"
                  : "border-muted bg-muted/5 opacity-75"
              )}>
                <h3 className="text-lg font-medium mb-2">{t('incomingOrder.quantities.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {formData.variety
                    ? t('incomingOrder.quantities.description')
                    : t('incomingOrder.quantities.selectVarietyFirst')}
                </p>

                <div className="space-y-4">
                  {adminInfo?.preferences?.bagSizes?.map((bagSize) => {
                    const fieldName = getBagSizeFieldName(bagSize);

                    return (
                      <div key={bagSize} className="flex items-center justify-between">
                        <label className="text-sm font-medium">{formatBagSizeLabel(bagSize)}</label>
                        <input
                          type="text"
                          name={fieldName}
                          value={formData.quantities[fieldName] || ""}
                          onChange={(e) => updateQuantity(fieldName, e.target.value)}
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
                    <label className="text-sm">{t('incomingOrder.quantities.total')}</label>
                    <span className={cn(
                      "text-lg",
                      !formData.variety && "text-muted-foreground"
                    )}>{calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {t('incomingOrder.buttons.continue')}
                </button>
              </div>
            </div>
          )}
        </AnimatedFormStep>

        {/* Step 2: Location and Remarks */}
        <AnimatedFormStep isVisible={currentStep === 2}>
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <h3 className="text-lg font-medium mb-2">{t('incomingOrder.location.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('incomingOrder.location.description')}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('incomingOrder.location.mainLabel')}</label>
                    <input
                      type="text"
                      value={formData.mainLocation}
                      onChange={(e) => updateFormData('mainLocation', e.target.value)}
                      placeholder={t('incomingOrder.location.placeholder')}
                      className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('incomingOrder.remarks.label')}</label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => updateFormData('remarks', e.target.value)}
                      placeholder={t('incomingOrder.remarks.placeholder')}
                      className="w-full p-3 border border-border rounded-md bg-background h-32 resize-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="font-custom flex-1 cursor-pointer rounded-lg border border-primary px-0 py-3 text-base font-medium text-primary bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  style={{ minWidth: 0 }}
                >
                  {t('incomingOrder.buttons.back')}
                </button>
                <button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="font-custom flex-1 cursor-pointer rounded-lg bg-primary px-0 py-3 text-base font-semibold text-secondary hover:bg-primary/85 focus:outline-none focus:ring-2 focus:ring-primary/50 transition relative"
                  style={{ minWidth: 0 }}
                >
                  {createOrderMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <Loader size="sm" className="mr-2" />
                      <span>{t('incomingOrder.buttons.creating')}</span>
                    </div>
                  ) : (
                    t('incomingOrder.buttons.create')
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

export default IncomingOrderFormContent;