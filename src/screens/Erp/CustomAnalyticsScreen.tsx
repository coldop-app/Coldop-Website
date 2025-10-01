import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Loader2, Filter, X, Eye } from "lucide-react";
import { RootState } from "@/store";
import { StoreAdmin } from "@/utils/types";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import TopBar from '@/components/common/Topbar/Topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CustomSelect from "@/components/common/CustomSelect/CustomSelect";
import ReceiptVoucherCard from "@/components/vouchers/ReceiptVoucherCard";
import DeliveryVoucherCard from "@/components/vouchers/DeliveryVoucherCard";
import AnalyticsDistributionChart from "@/components/charts/AnalyticsDistributionChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Package,
  Users,
  Settings,
  EyeOff
} from "lucide-react";

// Predefined bag size categories
const BAG_SIZE_CATEGORIES = [
  { value: "below-25", label: "Below 25mm" },
  { value: "25-30", label: "25-30mm" },
  { value: "30-35", label: "30-35mm" },
  { value: "35-40", label: "35-40mm" },
  { value: "40-45", label: "40-45mm" },
  { value: "45-50", label: "45-50mm" },
  { value: "50-55", label: "50-55mm" },
  { value: "55-60", label: "55-60mm" },
  { value: "60-65", label: "60-65mm" },
  { value: "65-70", label: "65-70mm" },
  { value: "70-75", label: "70-75mm" },
  { value: "75-80", label: "75-80mm" },
  { value: "80-85", label: "80-85mm" },
  { value: "85-90", label: "85-90mm" },
  { value: "90-95", label: "90-95mm" },
  { value: "95-100", label: "95-100mm" },
  { value: "above-100", label: "Above 100mm" }
];

interface FilterData {
  variety: string;
  generation: string;
  rouging: string;
  tuberType: string;
  grader: string;
  weighedStatus: string;
  bagType: string;
  bagSizeCategory: string;
  farmerId: string;
  dateFrom: string;
  dateTo: string;
}

interface OrderDetail {
  variety: string;
  bagSizes: Array<{
    size: string;
    quantity: {
      initialQuantity: number;
      currentQuantity: number;
    };
  }>;
}

interface Order {
  _id: string;
  generation: string;
  rouging: string;
  tuberType: string;
  grader: string;
  weighedStatus: boolean;
  bagType: string;
  farmerId: string;
  createdAt: string;
  orderDetails: OrderDetail[];
}

interface CustomAnalyticsData {
  stockSummary: Array<{
    variety: string;
    sizes: Array<{
      size: string;
      initialQuantity: number;
      currentQuantity: number;
    }>;
  }>;
  totals: {
    totalBags: number;
    totalCurrentBags: number;
    totalRemovedBags: number;
  };
  filters: {
    variety: string;
    generation: string;
    rouging: string;
    tuberType: string;
    grader: string;
    weighedStatus: string;
    bagType: string;
  };
}

const CustomAnalyticsScreen = () => {
  const { adminInfo } = useSelector((state: RootState) => state.auth) as { adminInfo: StoreAdmin | null };

  const [filterData, setFilterData] = useState<FilterData>({
    variety: "",
    generation: "",
    rouging: "",
    tuberType: "",
    grader: "",
    weighedStatus: "",
    bagType: "",
    bagSizeCategory: "",
    farmerId: "",
    dateFrom: "",
    dateTo: ""
  });

  const [availableOptions, setAvailableOptions] = useState({
    varieties: [] as string[],
    generations: [] as string[],
    rouging: [] as string[],
    tuberTypes: [] as string[],
    graders: [] as string[],
    bagTypes: [] as string[],
  });

  const [analyticsData, setAnalyticsData] = useState<CustomAnalyticsData | null>(null);
  const [showVouchers, setShowVouchers] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState(true);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch initial data to populate filter options
  const { data: initialData, isLoading: isLoadingInitialData, error: initialDataError } = useQuery({
    queryKey: ['analyticsInitialData', adminInfo?.token],
    queryFn: () => storeAdminApi.filterOrders({}, adminInfo?.token || ''),
    enabled: !!adminInfo?.token
  });

  // Fetch orders only when showVouchers is true
  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useQuery({
    queryKey: ['analyticsOrders', filterData, adminInfo?.token],
    queryFn: async () => {
      const params: Record<string, string | boolean | number> = {};

      // Only include non-empty filter values
      Object.entries(filterData).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          if (key === 'weighedStatus') {
            params[key] = value === 'true';
          } else if (key === 'bagSizeCategory') {
            params[key] = value;
          } else {
            params[key] = value;
          }
        }
      });

      try {
        const response = await storeAdminApi.filterOrders(params, adminInfo?.token || '');
        return response;
      } catch (error: unknown) {
        // Handle 404 error specifically for no orders found
        const axiosError = error as { response?: { status: number; data?: { status: string; message: string } } };
        if (axiosError?.response?.status === 404) {
          const errorData = axiosError?.response?.data;
          if (errorData?.status === "Fail" && errorData?.message) {
            throw new Error(errorData.message);
          }
        }
        throw error;
      }
    },
    enabled: !!adminInfo?.token && showVouchers,
    retry: false // Don't retry on 404 errors
  });

  // Update available options when initial data loads
  useEffect(() => {
    if (initialData?.data) {
      const varieties = new Set<string>();
      const generations = new Set<string>();
      const rouging = new Set<string>();
      const tuberTypes = new Set<string>();
      const graders = new Set<string>();
      const bagTypes = new Set<string>();

      initialData.data.forEach((order) => {
        // Add variety from order details
        order.orderDetails.forEach((detail) => {
          varieties.add(detail.variety);
        });

        // Add other fields from order level
        if (order.generation) generations.add(order.generation);
        if (order.rouging) rouging.add(order.rouging);
        if (order.tuberType) tuberTypes.add(order.tuberType);
        if (order.grader) graders.add(order.grader);
        if (order.bagType) bagTypes.add(order.bagType);
      });

      setAvailableOptions({
        varieties: Array.from(varieties).sort(),
        generations: Array.from(generations).sort(),
        rouging: Array.from(rouging).sort(),
        tuberTypes: Array.from(tuberTypes).sort(),
        graders: Array.from(graders).sort(),
        bagTypes: Array.from(bagTypes).sort(),
      });
    }
  }, [initialData?.data]);

  const updateFilterData = (field: keyof FilterData, value: string) => {
    setFilterData(prev => ({ ...prev, [field]: value }));
  };

  const clearAllFilters = () => {
    setFilterData({
      variety: "",
      generation: "",
      rouging: "",
      tuberType: "",
      grader: "",
      weighedStatus: "",
      bagType: "",
      bagSizeCategory: "",
      farmerId: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  const clearFilter = (field: keyof FilterData) => {
    setFilterData(prev => ({ ...prev, [field]: field === 'weighedStatus' || field === 'bagSizeCategory' ? '' : '' }));
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filterData).some(value => value && value.trim() !== '');

  // Count active filters
  const activeFiltersCount = Object.values(filterData).filter(value => value && value.trim() !== '').length;

  const handleAnalyticsSearch = async () => {
    if (!adminInfo?.token) return;

    setIsLoadingAnalytics(true);
    setAnalyticsError(null);

    try {
      const params: Record<string, string | boolean> = {};

      // Only include non-empty filter values for analytics
      Object.entries(filterData).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          if (key === 'weighedStatus') {
            params[key] = value === 'true';
          } else if (key === 'variety' || key === 'generation' || key === 'rouging' ||
                     key === 'tuberType' || key === 'grader' || key === 'bagType' || key === 'bagSizeCategory') {
            params[key] = value;
          }
        }
      });

      const response = await storeAdminApi.customAnalytics(params, adminInfo.token);
      setAnalyticsData(response.data);
      setShowVouchers(false); // Reset vouchers view when new analytics search is done
    } catch (error: unknown) {
      console.error('Error fetching analytics data:', error);

      // Handle 404 error specifically for no data found
      const axiosError = error as { response?: { status: number; data?: { status: string; message: string } } };
      if (axiosError?.response?.status === 404) {
        const errorData = axiosError?.response?.data;
        if (errorData?.status === "Fail" && errorData?.message) {
          setAnalyticsError(errorData.message);
        } else {
          setAnalyticsError('No data found for the selected filters. Try changing your filter criteria.');
        }
      } else {
        setAnalyticsError('Failed to fetch analytics data. Please try again.');
      }
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleViewVouchers = () => {
    setShowVouchers(true);
  };

  const orders = ordersData?.data || [];

  // Data processing functions for charts
  const COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6b7280"
  ];

  interface DistributionData {
    name: string;
    value: number;
    percentage: number;
    color: string;
    [key: string]: string | number;
  }

  const createDistributionData = (map: Map<string, number>): DistributionData[] => {
    const total = Array.from(map.values()).reduce((sum, value) => sum + value, 0);

    return Array.from(map.entries())
      .map(([name, value], index) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  };


  const processGenerationDistribution = (data: Order[]): DistributionData[] => {
    const generationMap = new Map<string, number>();

    data.forEach(order => {
      if (order.generation) {
        const current = generationMap.get(order.generation) || 0;
        const totalBags = order.orderDetails.reduce((sum: number, detail: OrderDetail) =>
          sum + detail.bagSizes.reduce((sizeSum: number, size) =>
            sizeSum + size.quantity.initialQuantity, 0
          ), 0
        );
        generationMap.set(order.generation, current + totalBags);
      }
    });

    return createDistributionData(generationMap);
  };

  const processRougingDistribution = (data: Order[]): DistributionData[] => {
    const rougingMap = new Map<string, number>();

    data.forEach(order => {
      if (order.rouging) {
        const current = rougingMap.get(order.rouging) || 0;
        const totalBags = order.orderDetails.reduce((sum: number, detail: OrderDetail) =>
          sum + detail.bagSizes.reduce((sizeSum: number, size) =>
            sizeSum + size.quantity.initialQuantity, 0
          ), 0
        );
        rougingMap.set(order.rouging, current + totalBags);
      }
    });

    return createDistributionData(rougingMap);
  };

  const processTuberTypeDistribution = (data: Order[]): DistributionData[] => {
    const tuberTypeMap = new Map<string, number>();

    data.forEach(order => {
      if (order.tuberType) {
        const current = tuberTypeMap.get(order.tuberType) || 0;
        const totalBags = order.orderDetails.reduce((sum: number, detail: OrderDetail) =>
          sum + detail.bagSizes.reduce((sizeSum: number, size) =>
            sizeSum + size.quantity.initialQuantity, 0
          ), 0
        );
        tuberTypeMap.set(order.tuberType, current + totalBags);
      }
    });

    return createDistributionData(tuberTypeMap);
  };

  const processGraderDistribution = (data: Order[]): DistributionData[] => {
    const graderMap = new Map<string, number>();

    data.forEach(order => {
      if (order.grader) {
        const current = graderMap.get(order.grader) || 0;
        const totalBags = order.orderDetails.reduce((sum: number, detail: OrderDetail) =>
          sum + detail.bagSizes.reduce((sizeSum: number, size) =>
            sizeSum + size.quantity.initialQuantity, 0
          ), 0
        );
        graderMap.set(order.grader, current + totalBags);
      }
    });

    return createDistributionData(graderMap);
  };

  const processWeighedStatusDistribution = (data: Order[]): DistributionData[] => {
    const statusMap = new Map<string, number>();

    data.forEach(order => {
      const status = order.weighedStatus ? 'Weighed' : 'Not Weighed';
      const current = statusMap.get(status) || 0;
      const totalBags = order.orderDetails.reduce((sum: number, detail: OrderDetail) =>
        sum + detail.bagSizes.reduce((sizeSum: number, size) =>
          sizeSum + size.quantity.initialQuantity, 0
        ), 0
      );
      statusMap.set(status, current + totalBags);
    });

    return createDistributionData(statusMap);
  };

  const processBagTypeDistribution = (data: Order[]): DistributionData[] => {
    const bagTypeMap = new Map<string, number>();

    data.forEach(order => {
      if (order.bagType) {
        const current = bagTypeMap.get(order.bagType) || 0;
        const totalBags = order.orderDetails.reduce((sum: number, detail: OrderDetail) =>
          sum + detail.bagSizes.reduce((sizeSum: number, size) =>
            sizeSum + size.quantity.initialQuantity, 0
          ), 0
        );
        bagTypeMap.set(order.bagType, current + totalBags);
      }
    });

    return createDistributionData(bagTypeMap);
  };

  const processBagSizeCategoryDistribution = (data: Order[]): DistributionData[] => {
    const bagSizeCategoryMap = new Map<string, number>();

    data.forEach(order => {
      order.orderDetails.forEach(detail => {
        detail.bagSizes.forEach(bagSize => {
          // Map bag size to category based on the size value
          const category = getBagSizeCategory(bagSize.size);
          if (category) {
            const current = bagSizeCategoryMap.get(category) || 0;
            bagSizeCategoryMap.set(category, current + bagSize.quantity.initialQuantity);
          }
        });
      });
    });

    return createDistributionData(bagSizeCategoryMap);
  };

  // Helper function to map bag size to category
  const getBagSizeCategory = (size: string): string | null => {
    // Extract numeric value from size string (assuming format like "25mm", "30-35mm", etc.)
    const numericMatch = size.match(/(\d+)/);
    if (!numericMatch) return null;

    const numericValue = parseInt(numericMatch[1]);

    if (numericValue < 25) return "Below 25mm";
    if (numericValue >= 25 && numericValue < 30) return "25-30mm";
    if (numericValue >= 30 && numericValue < 35) return "30-35mm";
    if (numericValue >= 35 && numericValue < 40) return "35-40mm";
    if (numericValue >= 40 && numericValue < 45) return "40-45mm";
    if (numericValue >= 45 && numericValue < 50) return "45-50mm";
    if (numericValue >= 50 && numericValue < 55) return "50-55mm";
    if (numericValue >= 55 && numericValue < 60) return "55-60mm";
    if (numericValue >= 60 && numericValue < 65) return "60-65mm";
    if (numericValue >= 65 && numericValue < 70) return "65-70mm";
    if (numericValue >= 70 && numericValue < 75) return "70-75mm";
    if (numericValue >= 75 && numericValue < 80) return "75-80mm";
    if (numericValue >= 80 && numericValue < 85) return "80-85mm";
    if (numericValue >= 85 && numericValue < 90) return "85-90mm";
    if (numericValue >= 90 && numericValue < 95) return "90-95mm";
    if (numericValue >= 95 && numericValue < 100) return "95-100mm";
    if (numericValue >= 100) return "Above 100mm";

    return null;
  };


  // Process data for charts from analytics data
  const processedData = useMemo(() => {
    if (!analyticsData || !analyticsData.stockSummary || analyticsData.stockSummary.length === 0) return null;

    // Process variety distribution directly from analytics data
    const varietyData = analyticsData.stockSummary.map(variety => {
      const totalBags = variety.sizes.reduce((sum, size) => sum + size.initialQuantity, 0);
      return {
        name: variety.variety,
        value: totalBags,
        percentage: (totalBags / analyticsData.totals.totalBags) * 100,
        color: COLORS[analyticsData.stockSummary.indexOf(variety) % COLORS.length]
      };
    }).sort((a, b) => b.value - a.value);

    // Create mock data for other distributions based on filters
    const mockOrders = analyticsData.stockSummary.map((variety, index) => ({
      _id: `mock-${index}`,
      generation: analyticsData.filters.generation || '',
      rouging: analyticsData.filters.rouging || '',
      tuberType: analyticsData.filters.tuberType || '',
      grader: analyticsData.filters.grader || '',
      weighedStatus: analyticsData.filters.weighedStatus === 'true',
      bagType: analyticsData.filters.bagType || '',
      farmerId: '',
      createdAt: new Date().toISOString(),
      orderDetails: [{
        variety: variety.variety,
        bagSizes: variety.sizes.map(size => ({
          size: size.size,
          quantity: {
            initialQuantity: size.initialQuantity,
            currentQuantity: size.currentQuantity
          }
        }))
      }]
    }));

    return {
      variety: varietyData,
      generation: processGenerationDistribution(mockOrders),
      rouging: processRougingDistribution(mockOrders),
      tuberType: processTuberTypeDistribution(mockOrders),
      grader: processGraderDistribution(mockOrders),
      weighedStatus: processWeighedStatusDistribution(mockOrders),
      bagType: processBagTypeDistribution(mockOrders),
      bagSizeCategory: processBagSizeCategoryDistribution(mockOrders),
      totalBags: analyticsData.totals.totalBags
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsData]);

  return (
    <>
      <TopBar title="Custom Analytics" isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
        {/* Filter Section */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                  Filter Orders
                </CardTitle>
              </div>
              {hasActiveFilters && (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Filter orders by various criteria to analyze your data
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Loading State for Filter Options */}
              {isLoadingInitialData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Loading filter options...
                    </span>
                  </div>
                </div>
              )}

              {/* Error State for Initial Data */}
              {initialDataError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="text-red-600 text-sm font-medium">
                      Failed to load filter options. Please refresh the page.
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Status */}
              {hasActiveFilters && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-800">
                        Filters Applied ({activeFiltersCount})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Variety */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Variety
                  </label>
                  <div className="relative">
                    <CustomSelect
                      value={filterData.variety}
                      onChange={(value) => updateFilterData('variety', value)}
                      placeholder="Select Variety"
                      options={availableOptions.varieties.map((variety: string) => ({
                        value: variety,
                        label: variety,
                      }))}
                    />
                    {filterData.variety && (
                      <button
                        type="button"
                        onClick={() => clearFilter('variety')}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Generation */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Generation
                  </label>
                  <div className="relative">
                    <CustomSelect
                      value={filterData.generation}
                      onChange={(value) => updateFilterData('generation', value)}
                      placeholder="Select Generation"
                      options={availableOptions.generations.map((gen: string) => ({
                        value: gen,
                        label: gen,
                      }))}
                    />
                    {filterData.generation && (
                      <button
                        type="button"
                        onClick={() => clearFilter('generation')}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Rouging */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Rouging
                  </label>
                  <div className="relative">
                    <CustomSelect
                      value={filterData.rouging}
                      onChange={(value) => updateFilterData('rouging', value)}
                      placeholder="Select Rouging"
                      options={availableOptions.rouging.map((rough: string) => ({
                        value: rough,
                        label: rough,
                      }))}
                    />
                    {filterData.rouging && (
                      <button
                        type="button"
                        onClick={() => clearFilter('rouging')}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tuber Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Tuber Type
                  </label>
                  <div className="relative">
                    <CustomSelect
                      value={filterData.tuberType}
                      onChange={(value) => updateFilterData('tuberType', value)}
                      placeholder="Select Tuber Type"
                      options={availableOptions.tuberTypes.map((type: string) => ({
                        value: type,
                        label: type,
                      }))}
                    />
                    {filterData.tuberType && (
                      <button
                        type="button"
                        onClick={() => clearFilter('tuberType')}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grader */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Grader
                  </label>
                  <div className="relative">
                    <CustomSelect
                      value={filterData.grader}
                      onChange={(value) => updateFilterData('grader', value)}
                      placeholder="Select Grader"
                      options={availableOptions.graders.map((grade: string) => ({
                        value: grade,
                        label: grade,
                      }))}
                    />
                    {filterData.grader && (
                      <button
                        type="button"
                        onClick={() => clearFilter('grader')}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Weighed Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Weighed Status
                  </label>
                  <div className="relative">
                    <CustomSelect
                      value={filterData.weighedStatus}
                      onChange={(value) => updateFilterData('weighedStatus', value)}
                      placeholder="Select Status"
                      options={[
                        { value: 'true', label: 'Weighed' },
                        { value: 'false', label: 'Not Weighed' }
                      ]}
                    />
                    {filterData.weighedStatus && (
                      <button
                        type="button"
                        onClick={() => clearFilter('weighedStatus')}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bag Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Bag Type
                  </label>
                  <div className="relative">
                    <CustomSelect
                      value={filterData.bagType}
                      onChange={(value) => updateFilterData('bagType', value)}
                      placeholder="Select Bag Type"
                      options={availableOptions.bagTypes.map((type: string) => ({
                        value: type,
                        label: type,
                      }))}
                    />
                    {filterData.bagType && (
                      <button
                        type="button"
                        onClick={() => clearFilter('bagType')}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bag Size Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Bag Size Category
                  </label>
                  <div className="relative">
                    <CustomSelect
                      value={filterData.bagSizeCategory}
                      onChange={(value) => updateFilterData('bagSizeCategory', value)}
                      placeholder="Select Size Category"
                      options={BAG_SIZE_CATEGORIES}
                    />
                    {filterData.bagSizeCategory && (
                      <button
                        type="button"
                        onClick={() => clearFilter('bagSizeCategory')}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Farmer ID */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Farmer ID
                  </label>
                  <input
                    type="text"
                    value={filterData.farmerId}
                    onChange={(e) => updateFilterData('farmerId', e.target.value)}
                    placeholder="Enter Farmer ID"
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Date From */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filterData.dateFrom}
                    onChange={(e) => updateFilterData('dateFrom', e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filterData.dateTo}
                    onChange={(e) => updateFilterData('dateTo', e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Error Message */}
              {analyticsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="text-red-600 text-sm font-medium">
                      {analyticsError}
                    </div>
                  </div>
                </div>
              )}

              {/* Search Button */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleAnalyticsSearch}
                  disabled={isLoadingAnalytics}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingAnalytics ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Getting Analytics...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Get Analytics
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Results Section */}
        {analyticsData && (
          <>
            {/* Analytics Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                          Total Bags
                        </p>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{analyticsData.totals.totalBags}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Initial bags received
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg flex-shrink-0">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                          Current Stock
                        </p>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{analyticsData.totals.totalCurrentBags}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Currently in storage
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="p-1.5 sm:p-2 bg-red-50 rounded-lg flex-shrink-0">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                          Removed Bags
                        </p>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{analyticsData.totals.totalRemovedBags}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Bags taken out
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg flex-shrink-0">
                          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                          Varieties
                        </p>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{analyticsData.stockSummary.length}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Different varieties
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Simple Variety Distribution Chart */}
            {analyticsData && analyticsData.stockSummary && analyticsData.stockSummary.length > 0 && (
              <Card className="bg-white shadow-sm">
                <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                    Variety Distribution
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Distribution of potato varieties in your filtered data
                  </p>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {analyticsData.stockSummary.map((variety, index) => {
                      const totalBags = variety.sizes.reduce((sum, size) => sum + size.initialQuantity, 0);
                      const percentage = (totalBags / analyticsData.totals.totalBags) * 100;
                      return (
                        <div key={variety.variety} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium text-gray-900">{variety.variety}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">{totalBags} bags</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics Visualization Section */}
            {processedData && processedData.totalBags > 0 && (
              <div className="space-y-6">
                {/* Header Controls */}
                <Card className="bg-white shadow-sm">
                  <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                          Data Distribution Analysis
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Visual breakdown of your data across different parameters
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setChartType(chartType === 'pie' ? 'bar' : 'pie')}
                          className="flex items-center gap-1"
                        >
                          {chartType === 'pie' ? <BarChart3 className="h-4 w-4" /> : <PieChartIcon className="h-4 w-4" />}
                          {chartType === 'pie' ? 'Bar Chart' : 'Pie Chart'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCharts(!showCharts)}
                          className="flex items-center gap-1"
                        >
                          {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {showCharts ? 'Hide Charts' : 'Show Charts'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {showCharts && (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="variety">Variety</TabsTrigger>
                      <TabsTrigger value="quality">Quality</TabsTrigger>
                      <TabsTrigger value="status">Status</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <AnalyticsDistributionChart
                          data={processedData.variety}
                          title="Variety Distribution"
                          description="Distribution of different potato varieties"
                          type={chartType}
                          icon={<Package className="h-5 w-5 text-blue-500" />}
                          totalValue={processedData.totalBags}
                        />
                        <AnalyticsDistributionChart
                          data={processedData.generation}
                          title="Generation Distribution"
                          description="Distribution across different generations"
                          type={chartType}
                          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                          totalValue={processedData.totalBags}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="variety" className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <AnalyticsDistributionChart
                          data={processedData.variety}
                          title="Variety Distribution"
                          description="Complete breakdown of potato varieties"
                          type={chartType}
                          icon={<Package className="h-5 w-5 text-blue-500" />}
                          totalValue={processedData.totalBags}
                        />
                        <AnalyticsDistributionChart
                          data={processedData.tuberType}
                          title="Tuber Type Distribution"
                          description="Distribution of different tuber types"
                          type={chartType}
                          icon={<BarChart3 className="h-5 w-5 text-purple-500" />}
                          totalValue={processedData.totalBags}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="quality" className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <AnalyticsDistributionChart
                          data={processedData.rouging}
                          title="Rouging Distribution"
                          description="Distribution of rouging types"
                          type={chartType}
                          icon={<Settings className="h-5 w-5 text-orange-500" />}
                          totalValue={processedData.totalBags}
                        />
                        <AnalyticsDistributionChart
                          data={processedData.grader}
                          title="Grader Distribution"
                          description="Distribution across different graders"
                          type={chartType}
                          icon={<Users className="h-5 w-5 text-indigo-500" />}
                          totalValue={processedData.totalBags}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="status" className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <AnalyticsDistributionChart
                          data={processedData.weighedStatus}
                          title="Weighing Status"
                          description="Distribution of weighed vs unweighed items"
                          type={chartType}
                          icon={<BarChart3 className="h-5 w-5 text-red-500" />}
                          totalValue={processedData.totalBags}
                        />
                        <AnalyticsDistributionChart
                          data={processedData.bagSizeCategory}
                          title="Bag Size Categories"
                          description="Distribution of different bag size categories"
                          type={chartType}
                          icon={<Package className="h-5 w-5 text-green-500" />}
                          totalValue={processedData.totalBags}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {/* Summary Statistics */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                    <CardTitle className="text-lg sm:text-xl font-bold text-blue-900">
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{processedData.totalBags}</div>
                        <div className="text-xs text-gray-600">Total Bags</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{processedData.variety.length}</div>
                        <div className="text-xs text-gray-600">Varieties</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{processedData.generation.length}</div>
                        <div className="text-xs text-gray-600">Generations</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{processedData.grader.length}</div>
                        <div className="text-xs text-gray-600">Graders</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Stock Summary Table */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                  Stock Summary by Variety
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                  Detailed breakdown of stock quantities by variety and size
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variety</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Removed</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyticsData.stockSummary.map((variety, varietyIndex) =>
                        variety.sizes.map((size, sizeIndex) => (
                          <tr key={`${varietyIndex}-${sizeIndex}`} className={sizeIndex === 0 ? "bg-gray-50" : ""}>
                            {sizeIndex === 0 && (
                              <td rowSpan={variety.sizes.length} className="px-4 py-4 text-sm font-medium text-gray-900 align-top">
                                {variety.variety}
                              </td>
                            )}
                            <td className="px-4 py-4 text-sm text-gray-900">{size.size}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{size.initialQuantity}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{size.currentQuantity}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{size.initialQuantity - size.currentQuantity}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* View Vouchers Button */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <Button
                    onClick={handleViewVouchers}
                    disabled={isLoadingOrders}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
                  >
                    {isLoadingOrders ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading Vouchers...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        View Related Vouchers
                      </>
                    )}
                  </Button>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Click to view all vouchers matching the current filter criteria
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Vouchers Section */}
        {showVouchers && (
        <Card className="bg-white shadow-sm">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                Related Vouchers
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">
                {isLoadingOrders
                  ? "Loading vouchers..."
                  : `Found ${orders.length} voucher${orders.length !== 1 ? 's' : ''}`
              }
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
              {isLoadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-gray-600">Loading vouchers...</span>
              </div>
            ) : ordersError ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Package className="h-12 w-12 text-red-300 mx-auto mb-3" />
                  <div className="text-lg font-medium text-red-600 mb-2">No orders found</div>
                  <p className="text-sm text-red-500 max-w-md mx-auto">
                    {ordersError.message || 'No orders match your current filter criteria. Try changing your filters.'}
                  </p>
                </div>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="text-primary hover:text-primary/80 hover:bg-primary/5"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All Filters
                </Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <div className="text-lg font-medium text-gray-500 mb-2">No vouchers found</div>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    No vouchers match your current filter criteria. Try adjusting your filters or clear all filters to see all vouchers.
                  </p>
                </div>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="text-primary hover:text-primary/80 hover:bg-primary/5"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id}>
                    {order.gatePass.type === "DELIVERY" ? (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      <DeliveryVoucherCard order={order as any} />
                    ) : (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      <ReceiptVoucherCard order={order as any} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </>
  );
};

export default CustomAnalyticsScreen;
