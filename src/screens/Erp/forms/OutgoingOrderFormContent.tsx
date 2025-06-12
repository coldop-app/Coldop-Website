import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import { RootState } from "@/store";
import { StoreAdmin } from "@/utils/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import debounce from "lodash/debounce";

// Custom scrollbar styles
const scrollbarStyles = `
  .scrollbar-thin::-webkit-scrollbar {
    height: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #CBD5E1;
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: #94A3B8;
  }
  @media (max-width: 768px) {
    .scrollbar-thin::-webkit-scrollbar {
      height: 4px;
    }
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarStyles;
  document.head.appendChild(style);
}

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

interface Farmer {
  _id: string;
  name: string;
  address?: string;
  mobileNumber?: string;
}

interface FormData {
  farmerName: string;
  farmerId: string;
  variety: string;
  remarks: string;
}

interface BagSizeQuantity {
  initialQuantity: number;
  currentQuantity: number;
}

interface OrderBagSize {
  size: string;
  quantity: BagSizeQuantity;
}

interface Voucher {
  type: string;
  voucherNumber: number;
}

interface OrderDetail {
  variety: string;
  bagSizes: OrderBagSize[];
  location: string;
}

interface IncomingOrder {
  _id: string;
  voucher: Voucher;
  dateOfSubmission: string;
  remarks: string;
  orderDetails: OrderDetail[];
  fulfilled: boolean;
}

interface IncomingOrdersResponse {
  status: string;
  data: IncomingOrder[];
}

interface BagSizeSelection {
  receiptNumber: number;
  bagSize: string;
  selectedQuantity: number;
  maxQuantity: number;
}

interface CreateOutgoingOrderPayload {
  orders: {
    orderId: string;
    variety: string;
    bagUpdates: {
      size: string;
      quantityToRemove: number;
    }[];
  }[];
  remarks: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const OutgoingOrderFormContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const farmer = location.state?.farmer as Farmer | undefined;
  const { adminInfo } = useSelector((state: RootState) => state.auth) as { adminInfo: StoreAdmin | null };

  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [availableVarieties, setAvailableVarieties] = useState<string[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<BagSizeSelection[]>([]);
  const [inputQuantity, setInputQuantity] = useState<string>('');
  const [activeBox, setActiveBox] = useState<{
    receiptNumber: number;
    bagSize: string;
    maxQuantity: number;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    farmerName: farmer?.name || "",
    farmerId: farmer?._id || "",
    variety: "",
    remarks: ""
  });

  // Fetch farmer's incoming orders
  const { data: farmerIncomingOrders, isLoading: isLoadingIncomingOrders } = useQuery<IncomingOrdersResponse>({
    queryKey: ['farmerIncomingOrders', formData.farmerId],
    queryFn: () => storeAdminApi.getFarmerIncomingOrders(formData.farmerId, adminInfo?.token || ''),
    enabled: !!formData.farmerId && !!adminInfo?.token
  });

  // Update available varieties when orders change
  useEffect(() => {
    if (farmerIncomingOrders?.data) {
      const varieties = new Set<string>();
      farmerIncomingOrders.data.forEach((order) => {
        order.orderDetails.forEach((detail) => {
          varieties.add(detail.variety);
        });
      });
      setAvailableVarieties(Array.from(varieties));
    }
  }, [farmerIncomingOrders?.data]);

  // Filter orders by selected variety
  const filteredOrders = React.useMemo(() => {
    if (!farmerIncomingOrders?.data || !formData.variety) return [];

    return farmerIncomingOrders.data.filter((order) =>
      order.orderDetails.some(detail => detail.variety === formData.variety)
    );
  }, [farmerIncomingOrders?.data, formData.variety]);

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

  // Get bag sizes from admin preferences
  const availableBagSizes = React.useMemo(() => {
    return adminInfo?.preferences?.bagSizes || [];
  }, [adminInfo?.preferences?.bagSizes]);

  // Handle box click
  const handleBoxClick = (receiptNumber: number, bagSize: string, maxQuantity: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setActiveBox({ receiptNumber, bagSize, maxQuantity });
    setInputQuantity('');
  };

  // Handle quantity submission
  const handleQuantitySubmit = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission
    if (activeBox && inputQuantity) {
      const quantity = Number(inputQuantity);
      if (quantity > 0 && quantity <= activeBox.maxQuantity) {
        setSelectedQuantities(prev => {
          const existing = prev.find(
            item => item.receiptNumber === activeBox.receiptNumber && item.bagSize === activeBox.bagSize
          );
          if (existing) {
            return prev.map(item =>
              item.receiptNumber === activeBox.receiptNumber && item.bagSize === activeBox.bagSize
                ? { ...item, selectedQuantity: quantity }
                : item
            );
          }
          return [...prev, {
            receiptNumber: activeBox.receiptNumber,
            bagSize: activeBox.bagSize,
            selectedQuantity: quantity,
            maxQuantity: activeBox.maxQuantity
          }];
        });
        setActiveBox(null);
        setInputQuantity('');
      }
    }
  };

  // Handle quantity removal
  const handleQuantityRemove = (receiptNumber: number, bagSize: string) => {
    setSelectedQuantities(prev =>
      prev.filter(item => !(item.receiptNumber === receiptNumber && item.bagSize === bagSize))
    );
  };

  // Get box color based on quantities
  const getBoxColor = (currentQuantity: number, initialQuantity: number, isSelected: boolean) => {
    if (isSelected) return 'border-green-500 bg-green-50';
    if (currentQuantity === 0 && initialQuantity === 0) return 'border-gray-200 bg-gray-50';
    if (currentQuantity < 20 && currentQuantity > 0) return 'border-red-400';
    if (currentQuantity < initialQuantity) return 'border-yellow-400';
    return 'border-gray-200 hover:border-primary';
  };

  // Function to generate request body for creating outgoing order
  const generateOutgoingOrderRequestBody = () => {
    // Helper function to capitalize first letter
    const capitalizeFirstLetter = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Group selected quantities by receipt number
    const groupedByReceipt = selectedQuantities.reduce((acc, sq) => {
      if (!acc[sq.receiptNumber]) {
        acc[sq.receiptNumber] = {
          bagUpdates: [] as { size: string; quantityToRemove: number }[]
        };
      }
      acc[sq.receiptNumber].bagUpdates.push({
        size: capitalizeFirstLetter(sq.bagSize),
        quantityToRemove: sq.selectedQuantity
      });
      return acc;
    }, {} as Record<number, { bagUpdates: { size: string; quantityToRemove: number }[] }>);

    // Find the order IDs from filtered orders
    const orderDetails = filteredOrders.reduce((acc, order) => {
      if (groupedByReceipt[order.voucher.voucherNumber]) {
        acc.push({
          orderId: order._id,
          variety: formData.variety,
          bagUpdates: groupedByReceipt[order.voucher.voucherNumber].bagUpdates
        });
      }
      return acc;
    }, [] as { orderId: string; variety: string; bagUpdates: { size: string; quantityToRemove: number }[] }[]);

    return {
      orders: orderDetails,
      remarks: formData.remarks
    };
  };

  // Add mutation hook for creating outgoing order with proper types
  const createOrderMutation: UseMutationResult<unknown, ApiError, CreateOutgoingOrderPayload> = useMutation<unknown, ApiError, CreateOutgoingOrderPayload>({
    mutationFn: (requestBody) =>
      storeAdminApi.createOutgoingOrder(
        formData.farmerId,
        requestBody,
        adminInfo?.token || ''
      ),
    onSuccess: () => {
      toast.success('Outgoing order created successfully');
      navigate('/erp/daybook'); // Navigate to daybook after success
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create outgoing order');
    }
  });

  return (
    <div className="w-full bg-background rounded-lg shadow-lg border border-border overflow-hidden">
      <div className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-5">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-3 sm:mb-4 md:mb-5">Create Outgoing Order</h1>

        {/* Progress indicator */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-[280px] sm:max-w-xs">
              <div className="relative flex justify-between">
                {/* Line background */}
                <div className="absolute h-0.5 bg-muted top-4 left-6 sm:left-8 w-[calc(100%-48px)] sm:w-[calc(100%-64px)]"></div>

                {/* Line active */}
                <div
                  className={`absolute h-0.5 top-4 left-6 sm:left-8 w-[calc(100%-48px)] sm:w-[calc(100%-64px)] transition-colors duration-500 ease-in-out ${
                    currentStep >= 2 ? 'bg-primary' : 'bg-muted'
                  }`}
                ></div>

                {/* Step 1 */}
                <div className="relative flex flex-col items-center">
                  <div className={`relative z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 1 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'
                  }`}>
                    1
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1 text-center whitespace-nowrap">Farmer & Variety</span>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col items-center">
                  <div className={`relative z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'
                  }`}>
                    2
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1 text-center">Quantities</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-3 sm:space-y-4 md:space-y-5">
          {/* Step 1: Farmer and Variety Selection */}
          <AnimatedFormStep isVisible={currentStep === 1}>
            {currentStep === 1 && (
              <div className="space-y-3 sm:space-y-4">
                {/* Farmer Selection */}
                <div>
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5">
                    Enter Account Name (search and select)
                  </label>
                  {farmer ? (
                    // Show farmer details when pre-selected
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">{farmer.name}</h3>
                        <span className="text-sm text-muted-foreground">Pre-selected farmer</span>
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
                      <input
                        id="farmer-search-input"
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Search Farmer"
                        className="flex-1 p-2 sm:p-2.5 text-sm border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition"
                        required
                      />
                      {/* Search Results Dropdown */}
                      {showDropdown && (searchResults?.length > 0 || isSearching) && (
                        <div
                          id="farmer-search-dropdown"
                          className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-auto z-50 bg-white rounded-md shadow-lg border border-gray-200"
                        >
                          {isSearching ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary" />
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
                                  <div className="font-medium text-sm sm:text-base">{result.name}</div>
                                  {(result.mobileNumber || result.address) && (
                                    <div className="text-xs sm:text-sm text-gray-500">
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
                <div className="border border-green-200 rounded-lg p-2 sm:p-3 bg-green-50/50">
                  <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-1.5">Select Variety</h3>
                  <p className="text-xs text-muted-foreground mb-2 sm:mb-3">
                    {availableVarieties.length > 0
                      ? "Choose from varieties in farmer's incoming orders"
                      : "No varieties found in farmer's incoming orders"}
                  </p>

                  <div className="relative">
                    <Select
                      value={formData.variety}
                      onValueChange={(value) => updateFormData('variety', value)}
                      disabled={isLoadingIncomingOrders || availableVarieties.length === 0}
                    >
                      <SelectTrigger className="w-full bg-background text-sm p-2 sm:p-2.5">
                        {isLoadingIncomingOrders ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            <span>Loading varieties...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Select a variety" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {availableVarieties.map((variety: string) => (
                          <SelectItem key={variety} value={variety} className="text-sm">
                            {variety}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.farmerId && (
                  <div className="space-y-3">
                    {/* Orders Table */}
                    {isLoadingIncomingOrders ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        <span className="text-sm">Loading incoming orders...</span>
                      </div>
                    ) : filteredOrders.length > 0 ? (
                      <div className="relative -mx-2 sm:-mx-3 md:-mx-4">
                        <div className="overflow-x-auto">
                          <div className="min-w-[600px] px-2 sm:px-3 md:px-4">
                            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="p-2 sm:p-2.5 text-left border-b font-medium text-xs sm:text-sm text-gray-600 w-24 sm:w-28">R. Voucher</th>
                                  {availableBagSizes.map(size => (
                                    <th key={size} className="p-2 sm:p-2.5 text-center border-b font-medium text-xs sm:text-sm text-gray-600 w-[calc((100%-96px)/5)]">
                                      {size.toLowerCase()}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {filteredOrders.map(order => (
                                  <tr
                                    key={order._id}
                                    className="hover:bg-gray-50/50 transition-colors"
                                  >
                                    <td className="p-2 sm:p-2.5 border-b">
                                      <div className="font-medium text-sm sm:text-base">#{order.voucher.voucherNumber}</div>
                                      {order.orderDetails[0]?.location && (
                                        <div className="text-[10px] sm:text-xs text-gray-500">
                                          Location: {order.orderDetails[0].location}
                                        </div>
                                      )}
                                    </td>
                                    {availableBagSizes.map(size => {
                                      const totalQuantities = order.orderDetails.reduce((acc, detail) => {
                                        const bagSize = detail.bagSizes.find(b => b.size.toLowerCase() === size.toLowerCase());
                                        if (bagSize) {
                                          acc.current += bagSize.quantity.currentQuantity;
                                          acc.initial += bagSize.quantity.initialQuantity;
                                        }
                                        return acc;
                                      }, { current: 0, initial: 0 });

                                      const isSelected = selectedQuantities.some(
                                        sq => sq.receiptNumber === order.voucher.voucherNumber &&
                                             sq.bagSize === size
                                      );

                                      return (
                                        <td key={size} className="p-1 sm:p-1.5 md:p-2 border-b text-center">
                                          <div className="flex items-center justify-center">
                                            <button
                                              type="button"
                                              onClick={(e) => handleBoxClick(
                                                order.voucher.voucherNumber,
                                                size,
                                                totalQuantities.current,
                                                e
                                              )}
                                              className={`
                                                relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg border-2
                                                ${getBoxColor(
                                                  totalQuantities.current,
                                                  totalQuantities.initial,
                                                  isSelected
                                                )}
                                                transition-all duration-200 transform hover:scale-105
                                                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                              `}
                                              disabled={totalQuantities.current === 0}
                                            >
                                              <div className="text-[11px] sm:text-xs font-medium">
                                                {totalQuantities.current}
                                              </div>
                                              <div className="text-[9px] sm:text-xs text-gray-500">
                                                /{totalQuantities.initial}
                                              </div>
                                              {selectedQuantities.some(sq =>
                                                sq.receiptNumber === order.voucher.voucherNumber &&
                                                sq.bagSize === size
                                              ) && (
                                                <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] bg-primary rounded-full flex items-center justify-center text-white text-[9px] sm:text-[10px] font-medium shadow-sm px-1 border border-white">
                                                  {selectedQuantities.find(sq =>
                                                    sq.receiptNumber === order.voucher.voucherNumber &&
                                                    sq.bagSize === size
                                                  )?.selectedQuantity}
                                                </div>
                                              )}
                                            </button>
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Mobile Scroll Hint */}
                        <div className="text-[10px] sm:text-xs text-gray-500 mt-2 text-center md:hidden">
                          Swipe horizontally to see more sizes
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {formData.variety
                          ? `No orders found for variety ${formData.variety}`
                          : 'Please select a variety to view orders'}
                      </p>
                    )}

                    {/* Selected Quantities Summary */}
                    {selectedQuantities.length > 0 && (
                      <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2 text-sm sm:text-base">Selected Quantities:</h4>
                        <div className="space-y-2">
                          {selectedQuantities.map((sq, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm">
                                Receipt #{sq.receiptNumber} - {sq.bagSize}: {sq.selectedQuantity} bags
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityRemove(sq.receiptNumber, sq.bagSize)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.farmerName.trim()) {
                        toast.error("Please enter farmer name");
                        return;
                      }
                      if (!formData.variety) {
                        toast.error("Please select a variety");
                        return;
                      }
                      setCurrentStep(2);
                    }}
                    className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </AnimatedFormStep>

          {/* Step 2: Order Review and Submission */}
          <AnimatedFormStep isVisible={currentStep === 2}>
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Review Order Details</h3>

                  {/* Selected Quantities Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium mb-3">Selected Quantities:</h4>
                    <div className="space-y-2">
                      {selectedQuantities.map((sq, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>
                            Receipt #{sq.receiptNumber} - {sq.bagSize}
                          </span>
                          <span className="font-medium">{sq.selectedQuantity} bags</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Remarks Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Order Remarks
                    </label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Enter any remarks for this order"
                      className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      rows={3}
                    />
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      disabled={createOrderMutation.isPending}
                      className="flex-1 py-2.5 px-4 border border-primary text-primary rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const requestBody = generateOutgoingOrderRequestBody();
                        console.log('Outgoing Order Request Body:', JSON.stringify(requestBody, null, 2));
                        createOrderMutation.mutate(requestBody);
                      }}
                      disabled={createOrderMutation.isPending || selectedQuantities.length === 0}
                      className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Order'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </AnimatedFormStep>
        </form>
      </div>

      {/* Quantity Input Modal */}
      {activeBox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium">Quantity to be removed</h3>
              <button
                type="button"
                onClick={() => setActiveBox(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-2">
                  Current Available Quantity : {activeBox.maxQuantity}
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <label className="text-sm sm:text-base text-gray-700 font-medium whitespace-nowrap">
                    Enter Qty :
                  </label>
                  <input
                    type="number"
                    value={inputQuantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (Number(value) >= 0 && Number(value) <= activeBox.maxQuantity)) {
                        setInputQuantity(value);
                      }
                    }}
                    className="flex-1 p-2 sm:p-2.5 text-sm sm:text-base rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    placeholder="Enter quantity"
                    min="1"
                    max={activeBox.maxQuantity}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuantitySubmit}
                className="w-full bg-green-500 text-white rounded-md py-2 sm:py-2.5 text-sm sm:text-base font-medium hover:bg-green-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutgoingOrderFormContent;