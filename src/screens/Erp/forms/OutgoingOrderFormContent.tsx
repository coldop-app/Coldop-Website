import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import type { CreateOutgoingOrderPayload } from "@/lib/api/storeAdmin";
import { RootState } from "@/store";
import { StoreAdmin } from "@/utils/types";
import CustomSelect from "@/components/common/CustomSelect/CustomSelect";
import MultiSelect from "@/components/common/MultiSelect";
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

const AnimatedFormStep = memo(({ isVisible, children }: AnimatedFormStepProps) => {
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
});

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
  generation: string;
  rouging: string;
  tuberType: string;
  grader: string;
  weighedStatus: string;
  approxWeight: string;
  bagType: string;
  remarks: string;
}

interface BagSizeQuantity {
  initialQuantity: number;
  currentQuantity: number;
}

interface OrderBagSize {
  size: string;
  quantity: BagSizeQuantity;
  location: string;
}

interface GatePass {
  type: string;
  gatePassNumber: number;
}

interface OrderDetail {
  variety: string;
  bagSizes: OrderBagSize[];
  location: string;
}

interface IncomingOrder {
  _id: string;
  gatePass: GatePass;
  coldStorageId: string;
  farmerId: string;
  generation: string;
  tuberType: string;
  grader: string;
  weighedStatus: boolean;
  approxWeight: string;
  bagType: string;
  dateOfSubmission: string;
  remarks: string;
  currentStockAtThatTime: number;
  orderDetails: OrderDetail[];
  fulfilled: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  rouging: string;
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
  // Pre-selected farmer data
  const farmer = useMemo<Farmer>(
    () => ({
      _id: "68d8b55df99e71019a8661f2",
      name: "Bhatti Agritech",
      address: "Jalandhar",
      mobileNumber: "9914365651",
    }),
    []
  );
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
  const [availableGenerations, setAvailableGenerations] = useState<string[]>([]);
  const [availableRouging, setAvailableRouging] = useState<string[]>([]);
  const [availableTuberTypes, setAvailableTuberTypes] = useState<string[]>([]);
  const [availableGraders, setAvailableGraders] = useState<string[]>([]);
  const [availableWeighedStatus, setAvailableWeighedStatus] = useState<string[]>([]);
  const [availableApproxWeights, setAvailableApproxWeights] = useState<string[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<BagSizeSelection[]>([]);
  const [inputQuantity, setInputQuantity] = useState<string>('');
  const [selectedBagSizes, setSelectedBagSizes] = useState<string[]>([]);
  const [activeBox, setActiveBox] = useState<{
    receiptNumber: number;
    bagSize: string;
    maxQuantity: number;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    farmerName: farmer.name,
    farmerId: farmer._id,
    variety: "",
    generation: "",
    rouging: "",
    tuberType: "",
    grader: "",
    weighedStatus: "true",
    approxWeight: "",
    bagType: "jute",
    remarks: ""
  });

  // Fetch farmer's incoming orders
  const { data: farmerIncomingOrders, isLoading: isLoadingIncomingOrders } = useQuery<IncomingOrdersResponse>({
    queryKey: ['farmerIncomingOrders', formData.farmerId],
    queryFn: () => storeAdminApi.getFarmerIncomingOrders(formData.farmerId, adminInfo?.token || ''),
    enabled: !!formData.farmerId && !!adminInfo?.token
  });

  // Update available options when orders change
  useEffect(() => {
    if (farmerIncomingOrders?.data) {
      const varieties = new Set<string>();
      const generations = new Set<string>();
      const rouging = new Set<string>();
      const tuberTypes = new Set<string>();
      const graders = new Set<string>();
      const weighedStatus = new Set<string>();
      const approxWeights = new Set<string>();

      farmerIncomingOrders.data.forEach((order) => {
        // Add variety from order details
        order.orderDetails.forEach((detail) => {
          varieties.add(detail.variety);
        });

        // Add other fields from order level
        if (order.generation) generations.add(order.generation);
        if (order.rouging) rouging.add(order.rouging);
        if (order.tuberType) tuberTypes.add(order.tuberType);
        if (order.grader) graders.add(order.grader);
        if (order.approxWeight) approxWeights.add(order.approxWeight);

        // Add weighed status options
        weighedStatus.add(order.weighedStatus ? "true" : "false");
      });

      setAvailableVarieties(Array.from(varieties));
      setAvailableGenerations(Array.from(generations));
      setAvailableRouging(Array.from(rouging));
      setAvailableTuberTypes(Array.from(tuberTypes));
      setAvailableGraders(Array.from(graders));
      setAvailableWeighedStatus(Array.from(weighedStatus));
      setAvailableApproxWeights(Array.from(approxWeights));
    }
  }, [farmerIncomingOrders?.data]);

  // Update the filteredOrders useMemo - now shows all orders initially
  const filteredOrders = React.useMemo(() => {
    if (!farmerIncomingOrders?.data) return [];

    return farmerIncomingOrders.data.filter((order) => {
      // Filter by variety if selected
      const hasVariety = !formData.variety || order.orderDetails.some(detail => detail.variety === formData.variety);

      // Filter by other fields if they are selected
      const hasGeneration = !formData.generation || order.generation === formData.generation;
      const hasRouging = !formData.rouging || order.rouging === formData.rouging;
      const hasTuberType = !formData.tuberType || order.tuberType === formData.tuberType;
      const hasGrader = !formData.grader || order.grader === formData.grader;
      const hasWeighedStatus = !formData.weighedStatus || (order.weighedStatus ? "true" : "false") === formData.weighedStatus;
      const hasApproxWeight = !formData.approxWeight || order.approxWeight === formData.approxWeight;

      return hasVariety && hasGeneration && hasRouging && hasTuberType && hasGrader && hasWeighedStatus && hasApproxWeight;
    });
  }, [farmerIncomingOrders?.data, formData.variety, formData.generation, formData.rouging, formData.tuberType, formData.grader, formData.weighedStatus, formData.approxWeight]);


  // Get active bag sizes (columns with at least one cell that has quantities)
  const activeBagSizes = React.useMemo(() => {
    if (!filteredOrders?.length) return [];

    const activeSizes = new Set<string>();

    filteredOrders.forEach(order => {
      order.orderDetails.forEach(detail => {
        detail.bagSizes.forEach(bagSize => {
          // Only include bag sizes that have current quantity > 0
          if (bagSize.quantity.currentQuantity > 0) {
            activeSizes.add(bagSize.size);
          }
        });
      });
    });

    const allActiveSizes = Array.from(activeSizes);

    // If no bag sizes are selected, show all active sizes
    if (selectedBagSizes.length === 0) {
      return allActiveSizes;
    }

    // Filter to only show selected bag sizes
    return allActiveSizes.filter(size => selectedBagSizes.includes(size));
  }, [filteredOrders, selectedBagSizes]);

  // Add a new useMemo for sorted bag sizes
  const sortedBagSizes = useMemo(() => {
    return sortBagSizes(adminInfo?.preferences?.bagSizes);
  }, [adminInfo?.preferences?.bagSizes]);

  // Get all available bag sizes for the multi-select
  const allAvailableBagSizes = React.useMemo(() => {
    if (!filteredOrders?.length) return [];

    const allSizes = new Set<string>();

    filteredOrders.forEach(order => {
      order.orderDetails.forEach(detail => {
        detail.bagSizes.forEach(bagSize => {
          // Only include bag sizes that have current quantity > 0
          if (bagSize.quantity.currentQuantity > 0) {
            allSizes.add(bagSize.size);
          }
        });
      });
    });

    return Array.from(allSizes);
  }, [filteredOrders]);

  // Farmer search query
  const { data: searchResults, isLoading: isSearching, refetch } = useQuery({
    queryKey: ['searchFarmers', searchQuery],
    queryFn: () => storeAdminApi.searchFarmers(adminInfo?._id || '', searchQuery, adminInfo?.token || ''),
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

  // Function to clear all filters
  const clearAllFilters = () => {
    setFormData(prev => ({
      ...prev,
      variety: "",
      generation: "",
      rouging: "",
      tuberType: "",
      grader: "",
      weighedStatus: "true",
      approxWeight: ""
    }));
    setSelectedBagSizes([]);
  };

  // Function to clear individual filter
  const clearFilter = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'weighedStatus' ? 'true' : ''
    }));
  };

  // Check if any filters are active
  const hasActiveFilters = formData.variety || formData.generation || formData.rouging ||
                          formData.tuberType || formData.grader ||
                          (formData.weighedStatus && formData.weighedStatus !== "true") || formData.approxWeight ||
                          selectedBagSizes.length > 0;

  // Count active filters
  const activeFiltersCount = [
    formData.variety,
    formData.generation,
    formData.rouging,
    formData.tuberType,
    formData.grader,
    (formData.weighedStatus && formData.weighedStatus !== "true") ? formData.weighedStatus : null,
    formData.approxWeight,
    selectedBagSizes.length > 0 ? `Bag Sizes (${selectedBagSizes.length})` : null
  ].filter(Boolean).length;

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

  // Handle box click - memoized for performance
  const handleBoxClick = useCallback((receiptNumber: number, bagSize: string, maxQuantity: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setActiveBox({ receiptNumber, bagSize, maxQuantity });
    setInputQuantity('');

    // Auto-focus the input field after modal opens
    setTimeout(() => {
      const inputElement = document.getElementById('quantity-input') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  }, []);

  // Handle quantity submission - memoized for performance
  const handleQuantitySubmit = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission
    if (activeBox && inputQuantity && inputQuantity.trim() !== '') {
      const quantity = parseInt(inputQuantity, 10); // Ensure it's an integer
      if (!isNaN(quantity) && quantity > 0 && quantity <= activeBox.maxQuantity) {
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
  }, [activeBox, inputQuantity]);

  // Handle quantity removal - memoized for performance
  const handleQuantityRemove = useCallback((receiptNumber: number, bagSize: string) => {
    setSelectedQuantities(prev =>
      prev.filter(item => !(item.receiptNumber === receiptNumber && item.bagSize === bagSize))
    );
  }, []);

  // Memoized close modal handler
  const handleCloseModal = useCallback(() => {
    setActiveBox(null);
    setInputQuantity('');
  }, []);

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

  // Handle escape key for modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeBox) {
        handleCloseModal();
      }
    };

    if (activeBox) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [activeBox, handleCloseModal]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (activeBox) {
      const timer = setTimeout(() => {
        const inputElement = document.getElementById('quantity-input') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
          inputElement.select(); // Select all text for easy replacement
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeBox]);

  // Add handleSelectAll function after handleQuantityRemove - memoized for performance
  const handleSelectAll = useCallback(() => {
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
              receiptNumber: order.gatePass.gatePassNumber,
              bagSize: bagSize.size,
              selectedQuantity: bagSize.quantity.currentQuantity,
              maxQuantity: bagSize.quantity.currentQuantity
            });
          }
        });
      });
    });

    setSelectedQuantities(newSelectedQuantities);
  }, [filteredOrders, selectedQuantities.length]);

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

  // Add handleSelectVoucher function after handleSelectAll - memoized for performance
  const handleSelectVoucher = useCallback((voucherNumber: number) => {
    // Check if all quantities for this voucher are already selected
    const voucherSelections = selectedQuantities.filter(sq => sq.receiptNumber === voucherNumber);
    const totalAvailableQuantitiesForVoucher = filteredOrders
      .filter(order => order.gatePass.gatePassNumber === voucherNumber)
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
    const order = filteredOrders.find(o => o.gatePass.gatePassNumber === voucherNumber);
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
  }, [filteredOrders, selectedQuantities]);

  // Add isVoucherSelected function after handleSelectVoucher - memoized for performance
  const isVoucherSelected = useCallback((voucherNumber: number) => {
    const voucherSelections = selectedQuantities.filter(sq => sq.receiptNumber === voucherNumber);
    const totalAvailableQuantitiesForVoucher = filteredOrders
      .filter(order => order.gatePass.gatePassNumber === voucherNumber)
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
  }, [filteredOrders, selectedQuantities]);

  // Get box color based on quantities - memoized for performance
  const getBoxColor = useCallback((currentQuantity: number, initialQuantity: number, isSelected: boolean) => {
    if (isSelected) return 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg shadow-emerald-200/50';
    if (currentQuantity === 0 && initialQuantity === 0) return 'border-gray-200 bg-gradient-to-br from-gray-200 to-gray-300 cursor-not-allowed opacity-60';
    if (currentQuantity < 20 && currentQuantity > 0) return 'border-red-400 bg-gradient-to-br from-red-50 to-red-100 shadow-md shadow-red-200/30';
    if (currentQuantity < initialQuantity) return 'border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 shadow-md shadow-amber-200/30';
    return 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-primary hover:shadow-md hover:shadow-primary/20 hover:from-primary/5 hover:to-primary/10';
  }, []);

  // Memoized Bag Size Box Component for better performance
  const BagSizeBox = memo(({
    order,
    size,
    totalQuantities,
    bagSizeLocation,
    isSelected,
    onBoxClick
  }: {
    order: IncomingOrder;
    size: string;
    totalQuantities: { current: number; initial: number };
    bagSizeLocation?: string;
    isSelected: boolean;
    onBoxClick: (e: React.MouseEvent) => void;
  }) => (
    <button
      type="button"
      onClick={onBoxClick}
      className={`
        relative w-16 h-16 rounded-xl border-2
        ${getBoxColor(
          totalQuantities.current,
          totalQuantities.initial,
          isSelected
        )}
        transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
        flex flex-col items-center justify-center
        backdrop-blur-sm
        group
      `}
      disabled={totalQuantities.current === 0}
    >
      {/* Only show content if cell has quantities */}
      {totalQuantities.current > 0 || totalQuantities.initial > 0 ? (
        <>
          {/* Location at the top */}
          <div className="text-[10px] text-gray-600 mb-1 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-[8px]">📍</span>
            <span className="truncate max-w-[50px] font-medium">
              {bagSizeLocation || ''}
            </span>
          </div>

          {/* Quantity in the middle */}
          <div className="text-xs font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
            {totalQuantities.current}
          </div>
          <div className="text-[10px] text-gray-500 font-medium">
            /{totalQuantities.initial}
          </div>
        </>
      ) : null}

      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-emerald-500/50 px-1 border-2 border-white animate-pulse">
          {selectedQuantities.find(sq =>
            sq.receiptNumber === order.gatePass.gatePassNumber &&
            sq.bagSize === size
          )?.selectedQuantity}
        </div>
      )}
    </button>
  ));

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
        quantityToRemove: parseInt(sq.selectedQuantity.toString(), 10) // Ensure it's an integer
      });
      return acc;
    }, {} as Record<number, { bagUpdates: { size: string; quantityToRemove: number }[] }>);

    // Find the order IDs from filtered orders and create proper order structure
    const orders = filteredOrders
      .filter(order => groupedByReceipt[order.gatePass.gatePassNumber])
      .map(order => {
        // Get the variety from the order details (use the first variety found)
        const variety = order.orderDetails[0]?.variety || formData.variety;

        return {
          orderId: order._id,
          variety: variety,
          bagUpdates: groupedByReceipt[order.gatePass.gatePassNumber].bagUpdates
        };
      });

    return {
      generation: formData.generation,
      rouging: formData.rouging,
      tuberType: formData.tuberType,
      grader: formData.grader,
      weighedStatus: formData.weighedStatus === "true",
      approxWeight: formData.approxWeight,
      bagType: formData.bagType,
      remarks: formData.remarks,
      orders: orders
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
      // Force hard refresh to ensure scroll to top
      window.location.href = '/erp/daybook';
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
                        autoComplete="off"
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
                  <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                    <h3 className="text-sm sm:text-base font-medium">{t('outgoingOrder.variety.title')}</h3>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 sm:mb-3">
                    {availableVarieties.length > 0
                      ? "Filter by variety (optional) - Select a variety to filter orders, or leave empty to show all varieties"
                      : t('outgoingOrder.variety.noVarieties')}
                  </p>

                  <div className="relative">
                    <CustomSelect
                      value={formData.variety}
                      onChange={(value) => updateFormData('variety', value)}
                      placeholder="Select Variety"
                      options={availableVarieties.map((variety: string) => ({
                        value: variety,
                        label: variety,
                      }))}
                    />
                    {formData.variety && (
                      <button
                        type="button"
                        onClick={() => clearFilter('variety')}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Bag Size Filter */}
                {allAvailableBagSizes.length > 0 && (
                  <div className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-gradient-to-br from-gray-50/80 to-gray-100/80 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-gray-800">Filter Bag Sizes</h3>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {selectedBagSizes.length > 0
                              ? `${selectedBagSizes.length} of ${allAvailableBagSizes.length} sizes selected`
                              : `All ${allAvailableBagSizes.length} sizes available`
                            }
                          </p>
                        </div>
                      </div>
                      {selectedBagSizes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedBagSizes([])}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Show All
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <MultiSelect
                        options={allAvailableBagSizes.map((size: string) => ({
                          value: size,
                          label: size,
                        }))}
                        value={selectedBagSizes}
                        onChange={setSelectedBagSizes}
                        placeholder="Select specific bag sizes to display..."
                        maxDisplayItems={2}
                        className="border-gray-200 focus-within:border-gray-400 focus-within:ring-gray-100"
                      />

                      {/* Selected sizes preview */}
                      {selectedBagSizes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Selected:
                          </span>
                          {selectedBagSizes.map((size) => (
                            <span
                              key={size}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full border border-gray-200"
                            >
                              {size}
                              <button
                                type="button"
                                onClick={() => setSelectedBagSizes(prev => prev.filter(s => s !== size))}
                                className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Generation */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Generation <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <CustomSelect
                        value={formData.generation}
                        onChange={(value) => updateFormData('generation', value)}
                        placeholder="Select Generation"
                        options={availableGenerations.map((gen: string) => ({
                          value: gen,
                          label: gen,
                        }))}
                      />
                      {formData.generation && (
                        <button
                          type="button"
                          onClick={() => clearFilter('generation')}
                          className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rouging */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Rouging <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <CustomSelect
                        value={formData.rouging}
                        onChange={(value) => updateFormData('rouging', value)}
                        placeholder="Select Rouging"
                        options={availableRouging.map((rough: string) => ({
                          value: rough,
                          label: rough,
                        }))}
                      />
                      {formData.rouging && (
                        <button
                          type="button"
                          onClick={() => clearFilter('rouging')}
                          className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tuber Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Tuber Type <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <CustomSelect
                        value={formData.tuberType}
                        onChange={(value) => updateFormData('tuberType', value)}
                        placeholder="Select Tuber Type"
                        options={availableTuberTypes.map((type: string) => ({
                          value: type,
                          label: type,
                        }))}
                      />
                      {formData.tuberType && (
                        <button
                          type="button"
                          onClick={() => clearFilter('tuberType')}
                          className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grader */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Grader <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <CustomSelect
                        value={formData.grader}
                        onChange={(value) => updateFormData('grader', value)}
                        placeholder="Select Grade"
                        options={availableGraders.map((grade: string) => ({
                          value: grade,
                          label: grade,
                        }))}
                      />
                      {formData.grader && (
                        <button
                          type="button"
                          onClick={() => clearFilter('grader')}
                          className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Weighed Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Weighed Status <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <CustomSelect
                        value={formData.weighedStatus}
                        onChange={(value) => updateFormData('weighedStatus', value)}
                        placeholder="Select Status"
                        options={availableWeighedStatus.map((status: string) => ({
                          value: status,
                          label: status === "true" ? "Weighed" : "Not Weighed",
                        }))}
                      />
                      {formData.weighedStatus && formData.weighedStatus !== "true" && (
                        <button
                          type="button"
                          onClick={() => clearFilter('weighedStatus')}
                          className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Approximate Weight */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Approximate Weight (kg) <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <CustomSelect
                        value={formData.approxWeight}
                        onChange={(value) => updateFormData('approxWeight', value)}
                        placeholder="Select Weight"
                        options={availableApproxWeights.map((weight: string) => ({
                          value: weight,
                          label: weight,
                        }))}
                      />
                      {formData.approxWeight && (
                        <button
                          type="button"
                          onClick={() => clearFilter('approxWeight')}
                          className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bag Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Bag Type <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <CustomSelect
                        value={formData.bagType}
                        onChange={(value) => updateFormData('bagType', value)}
                        placeholder="Select Bag Type"
                        options={[
                          { value: "jute", label: "Jute" },
                          { value: "plastic", label: "Plastic" },
                          { value: "paper", label: "Paper" },
                          { value: "cloth", label: "Cloth" }
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {formData.farmerId && (
                  <div className="space-y-3">
                    {/* Filter Status */}
                    {hasActiveFilters && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-blue-800">
                              Filters Applied ({activeFiltersCount})
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {formData.variety && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  Variety: {formData.variety}
                                  <button
                                    type="button"
                                    onClick={() => clearFilter('variety')}
                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              )}
                              {formData.generation && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  Generation: {formData.generation}
                                  <button
                                    type="button"
                                    onClick={() => clearFilter('generation')}
                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              )}
                              {formData.rouging && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  Rouging: {formData.rouging}
                                  <button
                                    type="button"
                                    onClick={() => clearFilter('rouging')}
                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              )}
                              {formData.tuberType && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  Tuber Type: {formData.tuberType}
                                  <button
                                    type="button"
                                    onClick={() => clearFilter('tuberType')}
                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              )}
                              {formData.grader && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  Grader: {formData.grader}
                                  <button
                                    type="button"
                                    onClick={() => clearFilter('grader')}
                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              )}
                              {formData.weighedStatus && formData.weighedStatus !== "true" && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  Status: {formData.weighedStatus === "true" ? "Weighed" : "Not Weighed"}
                                  <button
                                    type="button"
                                    onClick={() => clearFilter('weighedStatus')}
                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              )}
                              {formData.approxWeight && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  Weight: {formData.approxWeight}
                                  <button
                                    type="button"
                                    onClick={() => clearFilter('approxWeight')}
                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              )}
                              {selectedBagSizes.length > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  Bag Sizes: {selectedBagSizes.join(', ')}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBagSizes([])}
                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={clearAllFilters}
                            className="text-xs px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Orders Table */}
                    {isLoadingIncomingOrders ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        <span className="text-sm">{t('outgoingOrder.orders.loading')}</span>
                      </div>
                    ) : (filteredOrders.length > 0 || !hasActiveFilters) ? (
                      <>
                        {/* Orders Count */}
                        <div className="text-sm text-gray-600 mb-3">
                          {hasActiveFilters
                            ? `Showing ${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''} matching your filters${selectedBagSizes.length > 0 ? ` (${activeBagSizes.length} bag size${activeBagSizes.length !== 1 ? 's' : ''} displayed)` : ''}`
                            : `Showing all ${farmerIncomingOrders?.data?.length || 0} order${(farmerIncomingOrders?.data?.length || 0) !== 1 ? 's' : ''}${selectedBagSizes.length > 0 ? ` (${activeBagSizes.length} bag size${activeBagSizes.length !== 1 ? 's' : ''} displayed)` : ''}`
                          }
                        </div>

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
                                    {sortedBagSizes(activeBagSizes).map(size => (
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
                                          checked={isVoucherSelected(order.gatePass.gatePassNumber)}
                                          onChange={() => handleSelectVoucher(order.gatePass.gatePassNumber)}
                                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                        />
                                      </td>
                                      <td className="p-2.5 border-b">
                                        <div className="flex flex-col gap-1">
                                          <div className="font-medium text-base">#{order.gatePass.gatePassNumber}</div>
                                          {order.orderDetails[0]?.location && (
                                            <div className="text-xs text-gray-500">
                                              {t('outgoingOrder.orders.location')}: {order.orderDetails[0].location}
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      {activeBagSizes.map(size => {
                                        const totalQuantities = order.orderDetails.reduce((acc, detail) => {
                                          const bagSize = detail.bagSizes.find(b => b.size === size);
                                          if (bagSize) {
                                            acc.current += bagSize.quantity.currentQuantity;
                                            acc.initial += bagSize.quantity.initialQuantity;
                                          }
                                          return acc;
                                        }, { current: 0, initial: 0 });

                                        // Get location for this bag size
                                        const bagSizeLocation = order.orderDetails.find(detail =>
                                          detail.bagSizes.some(b => b.size === size)
                                        )?.bagSizes.find(b => b.size === size)?.location;

                                        const isSelected = selectedQuantities.some(
                                          sq => sq.receiptNumber === order.gatePass.gatePassNumber &&
                                               sq.bagSize === size
                                        );

                                        return (
                                          <td key={size} className="p-2 border-b text-center">
                                            <div className="flex flex-col items-center justify-center">
                                              <BagSizeBox
                                                order={order}
                                                size={size}
                                                totalQuantities={totalQuantities}
                                                bagSizeLocation={bagSizeLocation}
                                                isSelected={isSelected}
                                                onBoxClick={(e) => handleBoxClick(
                                                  order.gatePass.gatePassNumber,
                                                  size,
                                                  totalQuantities.current,
                                                  e
                                                )}
                                              />
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
                                  <div className="font-medium">#{order.gatePass.gatePassNumber}</div>
                                  {order.orderDetails[0]?.location && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {t('outgoingOrder.orders.location')}: {order.orderDetails[0].location}
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleSelectVoucher(order.gatePass.gatePassNumber)}
                                    className={`text-xs px-2 py-1 rounded-md w-fit transition-colors ${
                                      isVoucherSelected(order.gatePass.gatePassNumber)
                                        ? "bg-primary text-white hover:bg-primary/90"
                                        : "text-primary border border-primary hover:bg-primary/5"
                                    }`}
                                  >
                                    {isVoucherSelected(order.gatePass.gatePassNumber) ? "Deselect Voucher" : "Select Voucher"}
                                  </button>
                                </div>
                              </div>
                              <div className="p-3">
                                <div className="grid grid-cols-3 gap-2">
                                  {activeBagSizes.map(size => {
                                    const totalQuantities = order.orderDetails.reduce((acc, detail) => {
                                      const bagSize = detail.bagSizes.find(b => b.size === size);
                                      if (bagSize) {
                                        acc.current += bagSize.quantity.currentQuantity;
                                        acc.initial += bagSize.quantity.initialQuantity;
                                      }
                                      return acc;
                                    }, { current: 0, initial: 0 });

                                    // Get location for this bag size
                                    const bagSizeLocation = order.orderDetails.find(detail =>
                                      detail.bagSizes.some(b => b.size === size)
                                    )?.bagSizes.find(b => b.size === size)?.location;

                                    const isSelected = selectedQuantities.some(
                                      sq => sq.receiptNumber === order.gatePass.gatePassNumber &&
                                           sq.bagSize === size
                                    );

                                    return (
                                      <div key={size} className="flex flex-col items-center">
                                        <div className="text-xs font-medium mb-1">{size}</div>
                                        <BagSizeBox
                                          order={order}
                                          size={size}
                                          totalQuantities={totalQuantities}
                                          bagSizeLocation={bagSizeLocation}
                                          isSelected={isSelected}
                                          onBoxClick={(e) => handleBoxClick(
                                            order.gatePass.gatePassNumber,
                                            size,
                                            totalQuantities.current,
                                            e
                                          )}
                                        />
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
                        {hasActiveFilters
                          ? "No orders match the selected filters. Try adjusting your filter criteria."
                          : "No orders available for this farmer."}
                      </p>
                    )}

                    {/* Selected Quantities Summary */}
                    {selectedQuantities.length > 0 && (
                      <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2 text-sm sm:text-base">{t('outgoingOrder.selectedQuantities.title')}</h4>
                        <div className="space-y-2">
                          {selectedQuantities.map((sq, index) => {
                            // Find the order and get the specific location for this bag size
                            const order = filteredOrders.find(o => o.gatePass.gatePassNumber === sq.receiptNumber);
                            let location = '';

                            if (order) {
                              // Find the specific bag size location within the order
                              for (const detail of order.orderDetails) {
                                const bagSize = detail.bagSizes.find(b => b.size === sq.bagSize);
                                if (bagSize && bagSize.location) {
                                  location = bagSize.location;
                                  break;
                                }
                              }
                            }

                            return (
                              <div key={index} className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
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
                                </div>
                                {location && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <span>📍</span>
                                    <span>{location}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
                      if (filteredOrders.length === 0 && hasActiveFilters) {
                        toast.error("No orders match the selected filters. Please adjust your filter criteria or clear filters to see all orders.");
                        return;
                      }
                      if (filteredOrders.length === 0) {
                        toast.error("No orders available for this farmer.");
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
                      {selectedQuantities.map((sq, index) => {
                        // Find the order and get the specific location for this bag size
                        const order = filteredOrders.find(o => o.gatePass.gatePassNumber === sq.receiptNumber);
                        let location = '';

                        if (order) {
                          // Find the specific bag size location within the order
                          for (const detail of order.orderDetails) {
                            const bagSize = detail.bagSizes.find(b => b.size === sq.bagSize);
                            if (bagSize && bagSize.location) {
                              location = bagSize.location;
                              break;
                            }
                          }
                        }

                        return (
                          <div key={index} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>
                                {t('outgoingOrder.selectedQuantities.receipt')} #{sq.receiptNumber} - {sq.bagSize}
                              </span>
                              <span className="font-medium">{sq.selectedQuantity} {t('outgoingOrder.selectedQuantities.bags')}</span>
                            </div>
                            {location && (
                              <div className="text-xs text-gray-500">
                                📍 {location}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                        console.log('Orders array length:', requestBody.orders.length);
                        console.log('First order structure:', requestBody.orders[0]);

                        // Validate the request body structure
                        if (requestBody.orders.length === 0) {
                          toast.error('No orders selected. Please select quantities first.');
                          return;
                        }

                        // Check if all orders have required fields
                        const invalidOrders = requestBody.orders.filter(order =>
                          !order.orderId || !order.variety || !order.bagUpdates || order.bagUpdates.length === 0
                        );

                        if (invalidOrders.length > 0) {
                          console.error('Invalid orders found:', invalidOrders);
                          toast.error('Some selected orders are missing required information.');
                          return;
                        }

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
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium">{t('outgoingOrder.quantityModal.title')}</h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 transition-colors"
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
                    id="quantity-input"
                    type="text"
                    value={inputQuantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and empty string
                      if (value === '' || /^\d+$/.test(value)) {
                        const numValue = Number(value);
                        // Only allow values between 1 and maxQuantity, or empty string
                        if (value === '' || (numValue >= 1 && numValue <= activeBox.maxQuantity)) {
                          setInputQuantity(value);
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle Enter key to submit
                      if (e.keyCode === 13) {
                        e.preventDefault();
                        // Create a synthetic mouse event for the submit handler
                        const syntheticEvent = {
                          preventDefault: () => {},
                        } as React.MouseEvent;
                        handleQuantitySubmit(syntheticEvent);
                        return;
                      }

                      // Allow: backspace, delete, tab, escape, home, end, left, right, up, down
                      if ([8, 9, 27, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                          (e.keyCode === 65 && e.ctrlKey === true) ||
                          (e.keyCode === 67 && e.ctrlKey === true) ||
                          (e.keyCode === 86 && e.ctrlKey === true) ||
                          (e.keyCode === 88 && e.ctrlKey === true)) {
                        return;
                      }
                      // Only allow numeric keys (0-9) on both regular and numpad
                      if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      // Prevent pasting non-numeric content
                      e.preventDefault();
                      const paste = (e.clipboardData || (window as Window & { clipboardData?: DataTransfer }).clipboardData).getData('text');
                      const numericPaste = paste.replace(/[^0-9]/g, '');
                      if (numericPaste) {
                        const numValue = parseInt(numericPaste, 10);
                        if (numValue >= 1 && numValue <= activeBox.maxQuantity) {
                          setInputQuantity(numericPaste);
                        }
                      }
                    }}
                    className="flex-1 p-2 sm:p-2.5 text-sm sm:text-base rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    placeholder={t('outgoingOrder.quantityModal.placeholder')}
                    autoComplete="off"
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