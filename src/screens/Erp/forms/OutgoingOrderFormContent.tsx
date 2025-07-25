import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
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

const sortBagSizes = (adminPreferences: string[] | undefined) => {
  if (!adminPreferences) {
    return (bagSizes: string[]) => bagSizes;
  }

  // Create a map of normalized bag size names to their index in admin preferences
  const preferenceOrder = new Map(
    adminPreferences.map((size, index) => [
      size.toLowerCase().replace(/[-\s]/g, ''), // Normalize by removing hyphens and spaces
      index
    ])
  );

  // Return a sorting function
  return (bagSizes: string[]) => {
    if (!bagSizes.length) return bagSizes;

    return [...bagSizes].sort((a, b) => {
      // Normalize the bag size names for comparison
      const aNormalized = a.toLowerCase().replace(/[-\s]/g, '');
      const bNormalized = b.toLowerCase().replace(/[-\s]/g, '');

      const aIndex = preferenceOrder.get(aNormalized);
      const bIndex = preferenceOrder.get(bNormalized);

      // If both sizes are in preferences, sort by their order
      if (aIndex !== undefined && bIndex !== undefined) {
        return aIndex - bIndex;
      }

      // If only one size is in preferences, put it first
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;

      // If neither size is in preferences, maintain original order
      return 0;
    });
  };
};

const OutgoingOrderFormContent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const farmer = location.state?.farmer as Farmer | undefined;
  const { adminInfo } = useSelector((state: RootState) => state.auth) as { adminInfo: StoreAdmin | null };

  // Get receipt number for outgoing order
  const { data: receiptNumberData, isLoading: isLoadingReceiptNumber } = useQuery({
    queryKey: ['outgoingReceiptNumber'],
    queryFn: () => storeAdminApi.getReceiptNumber('outgoing', adminInfo?.token || ''),
    enabled: !!adminInfo?.token
  });

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

  // Update the filteredOrders useMemo
  const filteredOrders = React.useMemo(() => {
    if (!farmerIncomingOrders?.data || !formData.variety) return [];

    return farmerIncomingOrders.data.filter((order) =>
      order.orderDetails.some(detail => detail.variety === formData.variety)
    );
  }, [farmerIncomingOrders?.data, formData.variety]);

  // Get available bag sizes from the first order's details
  const availableBagSizes = React.useMemo(() => {
    if (!filteredOrders.length) return adminInfo?.preferences?.bagSizes || [];

    // Get unique bag sizes from the first order
    const bagSizes = new Set<string>();
    filteredOrders[0].orderDetails.forEach(detail => {
      detail.bagSizes.forEach(bagSize => {
        bagSizes.add(bagSize.size);
      });
    });

    return Array.from(bagSizes);
  }, [filteredOrders, adminInfo?.preferences?.bagSizes]);

  // Add a new useMemo for sorted bag sizes
  const sortedBagSizes = useMemo(() => {
    return sortBagSizes(adminInfo?.preferences?.bagSizes);
  }, [adminInfo?.preferences?.bagSizes]);

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

  // Add handleSelectAll function after handleQuantityRemove
  const handleSelectAll = () => {
    // If we have selections matching all available quantities, deselect all
    const totalAvailableQuantities = filteredOrders.reduce((total, order) => {
      order.orderDetails.forEach(detail => {
        detail.bagSizes.forEach(bagSize => {
          if (bagSize.quantity.currentQuantity > 0) {
            total++;
          }
        });
      });
      return total;
    }, 0);

    if (selectedQuantities.length === totalAvailableQuantities) {
      // Deselect all
      setSelectedQuantities([]);
      return;
    }

    // Select all
    const newSelectedQuantities: BagSizeSelection[] = [];
    filteredOrders.forEach(order => {
      order.orderDetails.forEach(detail => {
        detail.bagSizes.forEach(bagSize => {
          if (bagSize.quantity.currentQuantity > 0) {
            newSelectedQuantities.push({
              receiptNumber: order.voucher.voucherNumber,
              bagSize: bagSize.size,
              selectedQuantity: bagSize.quantity.currentQuantity,
              maxQuantity: bagSize.quantity.currentQuantity
            });
          }
        });
      });
    });

    setSelectedQuantities(newSelectedQuantities);
  };

  // Add isAllSelected computation
  const isAllSelected = useMemo(() => {
    const totalAvailableQuantities = filteredOrders.reduce((total, order) => {
      order.orderDetails.forEach(detail => {
        detail.bagSizes.forEach(bagSize => {
          if (bagSize.quantity.currentQuantity > 0) {
            total++;
          }
        });
      });
      return total;
    }, 0);

    return selectedQuantities.length === totalAvailableQuantities && totalAvailableQuantities > 0;
  }, [selectedQuantities, filteredOrders]);

  // Add handleSelectVoucher function after handleSelectAll
  const handleSelectVoucher = (voucherNumber: number) => {
    // Check if all quantities for this voucher are already selected
    const voucherSelections = selectedQuantities.filter(sq => sq.receiptNumber === voucherNumber);
    const totalAvailableQuantitiesForVoucher = filteredOrders
      .filter(order => order.voucher.voucherNumber === voucherNumber)
      .reduce((total, order) => {
        order.orderDetails.forEach(detail => {
          detail.bagSizes.forEach(bagSize => {
            if (bagSize.quantity.currentQuantity > 0) {
              total++;
            }
          });
        });
        return total;
      }, 0);

    if (voucherSelections.length === totalAvailableQuantitiesForVoucher) {
      // Deselect all quantities for this voucher
      setSelectedQuantities(prev => prev.filter(sq => sq.receiptNumber !== voucherNumber));
      return;
    }

    // Select all available quantities for this voucher
    const order = filteredOrders.find(o => o.voucher.voucherNumber === voucherNumber);
    if (!order) return;

    const newSelections: BagSizeSelection[] = [];
    order.orderDetails.forEach(detail => {
      detail.bagSizes.forEach(bagSize => {
        if (bagSize.quantity.currentQuantity > 0) {
          newSelections.push({
            receiptNumber: voucherNumber,
            bagSize: bagSize.size,
            selectedQuantity: bagSize.quantity.currentQuantity,
            maxQuantity: bagSize.quantity.currentQuantity
          });
        }
      });
    });

    // Merge new selections with existing ones (excluding current voucher)
    setSelectedQuantities(prev => [
      ...prev.filter(sq => sq.receiptNumber !== voucherNumber),
      ...newSelections
    ]);
  };

  // Add isVoucherSelected function after handleSelectVoucher
  const isVoucherSelected = (voucherNumber: number) => {
    const voucherSelections = selectedQuantities.filter(sq => sq.receiptNumber === voucherNumber);
    const totalAvailableQuantitiesForVoucher = filteredOrders
      .filter(order => order.voucher.voucherNumber === voucherNumber)
      .reduce((total, order) => {
        order.orderDetails.forEach(detail => {
          detail.bagSizes.forEach(bagSize => {
            if (bagSize.quantity.currentQuantity > 0) {
              total++;
            }
          });
        });
        return total;
      }, 0);

    return voucherSelections.length === totalAvailableQuantitiesForVoucher && totalAvailableQuantitiesForVoucher > 0;
  };

  // Get box color based on quantities
  const getBoxColor = (currentQuantity: number, initialQuantity: number, isSelected: boolean) => {
    if (isSelected) return 'border-green-500 bg-green-50';
    if (currentQuantity === 0 && initialQuantity === 0) return 'border-gray-200 bg-gray-50';
    if (currentQuantity < 20 && currentQuantity > 0) return 'border-red-400';
    if (currentQuantity < initialQuantity) return 'border-yellow-400';
    return 'border-gray-200 hover:border-primary';
  };

  // Update the generateOutgoingOrderRequestBody function
  const generateOutgoingOrderRequestBody = () => {
    // Group selected quantities by receipt number
    const groupedByReceipt = selectedQuantities.reduce((acc, sq) => {
      if (!acc[sq.receiptNumber]) {
        acc[sq.receiptNumber] = {
          bagUpdates: [] as { size: string; quantityToRemove: number }[]
        };
      }
      acc[sq.receiptNumber].bagUpdates.push({
        size: sq.bagSize,  // Use the size exactly as is
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
      toast.success(t('outgoingOrder.success.orderCreated'));
      navigate('/erp/daybook'); // Navigate to daybook after success
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('outgoingOrder.errors.failedToCreate'));
    }
  });

  return (
    <div className="w-full bg-background rounded-lg shadow-lg border border-border overflow-hidden">
      <div className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-5">
        <div className="flex flex-col items-center mb-3 sm:mb-4 md:mb-5">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-3">{t('outgoingOrder.title')}</h1>
          {isLoadingReceiptNumber ? (
            <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-1.5 rounded-full">
              <Loader2 className="h-3 w-3 animate-spin text-red-600" />
              <span className="text-sm text-red-600">{t('outgoingOrder.loadingReceiptNumber')}</span>
            </div>
          ) : receiptNumberData?.receiptNumber ? (
            <div className="inline-flex items-center gap-2 bg-red-50/50 px-4 py-1.5 rounded-full">
              <span className="text-sm text-gray-600">{t('outgoingOrder.receiptNumber')}:</span>
              <span className="text-sm font-semibold text-red-600">#{receiptNumberData.receiptNumber}</span>
            </div>
          ) : null}
        </div>

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
                  <span className="text-[10px] sm:text-xs mt-1 text-center whitespace-nowrap">{t('outgoingOrder.steps.farmerVariety')}</span>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col items-center">
                  <div className={`relative z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'
                  }`}>
                    2
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1 text-center">{t('outgoingOrder.steps.quantities')}</span>
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
                    {t('outgoingOrder.farmer.label')}
                  </label>
                  {farmer ? (
                    // Show farmer details when pre-selected
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">{farmer.name}</h3>
                        <span className="text-sm text-muted-foreground">{t('outgoingOrder.farmer.preSelected')}</span>
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
                        placeholder={t('outgoingOrder.farmer.searchPlaceholder')}
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
                  <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-1.5">{t('outgoingOrder.variety.title')}</h3>
                  <p className="text-xs text-muted-foreground mb-2 sm:mb-3">
                                          {availableVarieties.length > 0
                        ? t('outgoingOrder.variety.description')
                        : t('outgoingOrder.variety.noVarieties')}
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
                            <span>{t('outgoingOrder.variety.loading')}</span>
                          </div>
                        ) : (
                                                      <SelectValue placeholder={t('outgoingOrder.variety.selectPlaceholder')} />
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
                        <span className="text-sm">{t('outgoingOrder.orders.loading')}</span>
                      </div>
                    ) : filteredOrders.length > 0 ? (
                      <>
                        {/* Select/Deselect All Button */}
                        <div className="mb-4">
                          <button
                            type="button"
                            onClick={handleSelectAll}
                            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
                              isAllSelected
                                ? "bg-primary text-white hover:bg-primary/90"
                                : "text-primary border border-primary hover:bg-primary/5"
                            }`}
                          >
                            {isAllSelected ? "Deselect All Quantities" : "Select All Quantities"}
                          </button>
                        </div>

                        {/* Desktop View - Hidden on mobile */}
                        <div className="hidden md:block relative -mx-4">
                          <div className="overflow-x-auto">
                            <div className="min-w-[600px] px-4">
                              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="p-2.5 text-center border-b font-medium text-sm text-gray-600 w-12">
                                      <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                      />
                                    </th>
                                    <th className="p-2.5 text-left border-b font-medium text-sm text-gray-600 w-28">{t('outgoingOrder.orders.receiptVoucher')}</th>
                                    {sortedBagSizes(availableBagSizes).map(size => (
                                      <th key={size} className="p-2.5 text-center border-b font-medium text-sm text-gray-600 w-[calc((100%-160px)/5)]">
                                        {size}
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
                                      <td className="p-2.5 border-b text-center">
                                        <input
                                          type="checkbox"
                                          checked={isVoucherSelected(order.voucher.voucherNumber)}
                                          onChange={() => handleSelectVoucher(order.voucher.voucherNumber)}
                                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                        />
                                      </td>
                                      <td className="p-2.5 border-b">
                                        <div className="flex flex-col gap-1">
                                          <div className="font-medium text-base">#{order.voucher.voucherNumber}</div>
                                          {order.orderDetails[0]?.location && (
                                            <div className="text-xs text-gray-500">
                                              {t('outgoingOrder.orders.location')}: {order.orderDetails[0].location}
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      {availableBagSizes.map(size => {
                                        const totalQuantities = order.orderDetails.reduce((acc, detail) => {
                                          const bagSize = detail.bagSizes.find(b => b.size === size);
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
                                          <td key={size} className="p-2 border-b text-center">
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
                                                  relative w-14 h-14 rounded-lg border-2
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
                                                <div className="text-xs font-medium">
                                                  {totalQuantities.current}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  /{totalQuantities.initial}
                                                </div>
                                                {selectedQuantities.some(sq =>
                                                  sq.receiptNumber === order.voucher.voucherNumber &&
                                                  sq.bagSize === size
                                                ) && (
                                                  <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-medium shadow-sm px-1 border border-white">
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
                        </div>

                        {/* Mobile View - Shown only on mobile */}
                        <div className="md:hidden space-y-4">
                          {filteredOrders.map(order => (
                            <div key={order._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <div className="p-3 bg-gray-50 border-b border-gray-200">
                                <div className="flex flex-col gap-1">
                                  <div className="font-medium">#{order.voucher.voucherNumber}</div>
                                  {order.orderDetails[0]?.location && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {t('outgoingOrder.orders.location')}: {order.orderDetails[0].location}
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleSelectVoucher(order.voucher.voucherNumber)}
                                    className={`text-xs px-2 py-1 rounded-md w-fit transition-colors ${
                                      isVoucherSelected(order.voucher.voucherNumber)
                                        ? "bg-primary text-white hover:bg-primary/90"
                                        : "text-primary border border-primary hover:bg-primary/5"
                                    }`}
                                  >
                                    {isVoucherSelected(order.voucher.voucherNumber) ? "Deselect Voucher" : "Select Voucher"}
                                  </button>
                                </div>
                              </div>
                              <div className="p-3">
                                <div className="grid grid-cols-3 gap-2">
                                  {availableBagSizes.map(size => {
                                    const totalQuantities = order.orderDetails.reduce((acc, detail) => {
                                      const bagSize = detail.bagSizes.find(b => b.size === size);
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
                                      <div key={size} className="flex flex-col items-center">
                                        <div className="text-xs font-medium mb-1">{size}</div>
                                        <button
                                          type="button"
                                          onClick={(e) => handleBoxClick(
                                            order.voucher.voucherNumber,
                                            size,
                                            totalQuantities.current,
                                            e
                                          )}
                                          className={`
                                            relative w-16 h-16 rounded-lg border-2
                                            ${getBoxColor(
                                              totalQuantities.current,
                                              totalQuantities.initial,
                                              isSelected
                                            )}
                                            transition-all duration-200 active:scale-95
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                          `}
                                          disabled={totalQuantities.current === 0}
                                        >
                                          <div className="text-sm font-medium">
                                            {totalQuantities.current}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            /{totalQuantities.initial}
                                          </div>
                                          {selectedQuantities.some(sq =>
                                            sq.receiptNumber === order.voucher.voucherNumber &&
                                            sq.bagSize === size
                                          ) && (
                                            <div className="absolute -top-2 -right-2 min-w-[22px] h-[22px] bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm px-1 border-2 border-white">
                                              {selectedQuantities.find(sq =>
                                                sq.receiptNumber === order.voucher.voucherNumber &&
                                                sq.bagSize === size
                                              )?.selectedQuantity}
                                            </div>
                                          )}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {formData.variety
                          ? `${t('outgoingOrder.orders.noOrders')} ${formData.variety}`
                          : t('outgoingOrder.orders.selectVariety')}
                      </p>
                    )}

                    {/* Selected Quantities Summary */}
                    {selectedQuantities.length > 0 && (
                      <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2 text-sm sm:text-base">{t('outgoingOrder.selectedQuantities.title')}</h4>
                        <div className="space-y-2">
                          {selectedQuantities.map((sq, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm">
                                {t('outgoingOrder.selectedQuantities.receipt')} #{sq.receiptNumber} - {sq.bagSize}: {sq.selectedQuantity} {t('outgoingOrder.selectedQuantities.bags')}
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
      toast.error(t('outgoingOrder.errors.enterFarmerName'));
      return;
    }
    if (!formData.variety) {
      toast.error(t('outgoingOrder.errors.selectVariety'));
      return;
    }
                      setCurrentStep(2);
                    }}
                    className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {t('outgoingOrder.buttons.continue')}
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
                  <h3 className="text-lg font-medium mb-4">{t('outgoingOrder.review.title')}</h3>

                  {/* Selected Quantities Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium mb-3">{t('outgoingOrder.selectedQuantities.title')}</h4>
                    <div className="space-y-2">
                      {selectedQuantities.map((sq, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>
                            {t('outgoingOrder.selectedQuantities.receipt')} #{sq.receiptNumber} - {sq.bagSize}
                          </span>
                                                      <span className="font-medium">{sq.selectedQuantity} {t('outgoingOrder.selectedQuantities.bags')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Remarks Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      {t('outgoingOrder.review.orderRemarks')}
                    </label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                                              placeholder={t('outgoingOrder.review.remarksPlaceholder')}
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
                      {t('outgoingOrder.buttons.back')}
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
                          {t('outgoingOrder.buttons.creating')}
                        </>
                      ) : (
                        t('outgoingOrder.buttons.create')
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
              <h3 className="text-base sm:text-lg font-medium">{t('outgoingOrder.quantityModal.title')}</h3>
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
                  {t('outgoingOrder.quantityModal.currentAvailable')} : {activeBox.maxQuantity}
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                                      <label className="text-sm sm:text-base text-gray-700 font-medium whitespace-nowrap">
                      {t('outgoingOrder.quantityModal.enterQty')} :
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
                                          placeholder={t('outgoingOrder.quantityModal.placeholder')}
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
                {t('outgoingOrder.quantityModal.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutgoingOrderFormContent;