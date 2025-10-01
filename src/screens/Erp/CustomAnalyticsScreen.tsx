import { useState, useMemo } from "react";
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


interface FilterData {
  variety: string;
  generation: string;
  rouging: string;
  tuberType: string;
  grader: string;
  weighedStatus: string;
  bagType: string;
  bagSizeCategory: string;
  dateFrom: string;
  dateTo: string;
}



interface CustomAnalyticsData {
  stockSummary: Array<{
    variety: string;
    sizes: Array<{
      size: string;
      initialQuantity: number;
      currentQuantity: number;
      quantityRemoved: number;
    }>;
  }>;
  totals: {
    totalBags: number;
    totalCurrentBags: number;
    totalRemovedBags: number;
  };
  orderCounts: {
    totalIncomingOrders: number;
    totalOutgoingOrders: number;
    totalOrders: number;
  };
  distributions: {
    varietyDistribution: Record<string, number>;
    generationDistribution: Record<string, number>;
    rougingDistribution: Record<string, number>;
    graderDistribution: Record<string, number>;
    bagSizeDistribution: Record<string, number>;
    tuberTypeDistribution: Record<string, number>;
    bagTypeDistribution: Record<string, number>;
    weighedStatusDistribution: Record<string, number>;
    varietyAnalysis: {
      byGeneration: Record<string, Record<string, number>>;
      byRouging: Record<string, Record<string, number>>;
      byGrader: Record<string, Record<string, number>>;
    };
    generationAnalysis: {
      byVariety: Record<string, Record<string, number>>;
      byRouging: Record<string, Record<string, number>>;
      byGrader: Record<string, Record<string, number>>;
    };
    rougingAnalysis: {
      byVariety: Record<string, Record<string, number>>;
      byGeneration: Record<string, Record<string, number>>;
      byGrader: Record<string, Record<string, number>>;
    };
    graderAnalysis: {
      byVariety: Record<string, Record<string, number>>;
      byGeneration: Record<string, Record<string, number>>;
      byRouging: Record<string, Record<string, number>>;
    };
    bagSizeAnalysis: {
      byVariety: Record<string, Record<string, number>>;
      byGeneration: Record<string, Record<string, number>>;
      byRouging: Record<string, Record<string, number>>;
      byGrader: Record<string, Record<string, number>>;
    };
    tuberTypeAnalysis: {
      byVariety: Record<string, Record<string, number>>;
      byGeneration: Record<string, Record<string, number>>;
      byRouging: Record<string, Record<string, number>>;
      byGrader: Record<string, Record<string, number>>;
    };
    bagTypeAnalysis: {
      byVariety: Record<string, Record<string, number>>;
      byGeneration: Record<string, Record<string, number>>;
      byRouging: Record<string, Record<string, number>>;
      byGrader: Record<string, Record<string, number>>;
    };
    weighedStatusAnalysis: {
      byVariety: Record<string, Record<string, number>>;
      byGeneration: Record<string, Record<string, number>>;
      byRouging: Record<string, Record<string, number>>;
      byGrader: Record<string, Record<string, number>>;
      byBagType: Record<string, Record<string, number>>;
      byTuberType: Record<string, Record<string, number>>;
    };
    summary: {
      totalOrders: number;
      totalOutgoingOrders: number;
      uniqueVarieties: number;
      uniqueGenerations: number;
      uniqueRougings: number;
      uniqueGraders: number;
      uniqueBagSizes: number;
      uniqueTuberTypes: number;
      uniqueBagTypes: number;
      weighedStatusCounts: {
        weighed: number;
        unweighed: number;
      };
    };
  };
  filters: {
    variety?: string;
    generation?: string;
    rouging?: string;
    tuberType?: string;
    grader?: string;
    weighedStatus?: string;
    bagType?: string;
  };
}

// Data processing functions for charts
const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6b7280"
];

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
    dateFrom: "",
    dateTo: ""
  });

  // Hardcoded options for dropdowns
  const availableOptions = {
    varieties: ["Himalini", "B101", "Jyoti"],
    generations: ["CF", "option2"],
    rouging: ["R1", "R2"],
    tuberTypes: ["Marketable", "Cut"],
    graders: ["Jandu", "option2"],
    bagTypes: ["jute", "leno"],
    weighedStatus: [
      { value: 'weighed', label: 'Weighed' },
      { value: 'unweighed', label: 'Not Weighed' }
    ]
  };

  // Get bag sizes from adminInfo preferences
  const bagSizeOptions = adminInfo?.preferences?.bagSizes || [];

  const [analyticsData, setAnalyticsData] = useState<CustomAnalyticsData | null>(null);
  const [showVouchers, setShowVouchers] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState(true);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [activeTab, setActiveTab] = useState("overview");


  // Fetch orders only when showVouchers is true
  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useQuery({
    queryKey: ['analyticsOrders', filterData, adminInfo?.token],
    queryFn: async () => {
      const params: Record<string, string | boolean | number> = {};

      // Only include non-empty filter values
      Object.entries(filterData).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          if (key === 'weighedStatus') {
            params[key] = value === 'weighed';
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
            params[key] = value === 'weighed';
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

  interface DistributionData {
    name: string;
    value: number;
    percentage: number;
    color: string;
    [key: string]: string | number;
  }





  // Process data for charts from analytics data
  const processedData = useMemo(() => {
    if (!analyticsData || !analyticsData.stockSummary || analyticsData.stockSummary.length === 0) return null;

    const { distributions, totals } = analyticsData;

    // Helper function to convert distribution objects to chart data
    const convertDistributionToChartData = (distribution: Record<string, number>, totalBags: number): DistributionData[] => {
      return Object.entries(distribution)
        .map(([name, value], index) => ({
          name,
          value,
          percentage: totalBags > 0 ? (value / totalBags) * 100 : 0,
          color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.value - a.value);
    };

    return {
      variety: convertDistributionToChartData(distributions.varietyDistribution, totals.totalBags),
      generation: convertDistributionToChartData(distributions.generationDistribution, totals.totalBags),
      rouging: convertDistributionToChartData(distributions.rougingDistribution, totals.totalBags),
      tuberType: convertDistributionToChartData(distributions.tuberTypeDistribution, totals.totalBags),
      grader: convertDistributionToChartData(distributions.graderDistribution, totals.totalBags),
      bagType: convertDistributionToChartData(distributions.bagTypeDistribution, totals.totalBags),
      bagSizeCategory: convertDistributionToChartData(distributions.bagSizeDistribution, totals.totalBags),
      weighedStatus: convertDistributionToChartData(distributions.weighedStatusDistribution, totals.totalBags),
      totalBags: totals.totalBags
    };
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
                      options={availableOptions.weighedStatus}
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
                      options={bagSizeOptions.map(size => ({
                        value: size,
                        label: size
                      }))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
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
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{analyticsData.distributions.summary.uniqueVarieties}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Different varieties
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
                        <div className="p-1.5 sm:p-2 bg-orange-50 rounded-lg flex-shrink-0">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                          Total Orders
                        </p>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{analyticsData.orderCounts.totalOrders}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Incoming: {analyticsData.orderCounts.totalIncomingOrders}
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
                        <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                          Weighed Status
                        </p>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{analyticsData.distributions.summary.weighedStatusCounts.weighed}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Weighed: {analyticsData.distributions.summary.weighedStatusCounts.weighed} | Unweighed: {analyticsData.distributions.summary.weighedStatusCounts.unweighed}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bag Type Distribution Chart */}
            {analyticsData && analyticsData.distributions.bagTypeDistribution && Object.keys(analyticsData.distributions.bagTypeDistribution).length > 0 && (
              <Card className="bg-white shadow-sm">
                <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                    Bag Type Distribution
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Distribution of bag types (jute vs leno) in your filtered data
                  </p>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {Object.entries(analyticsData.distributions.bagTypeDistribution).map(([bagType, count], index) => {
                      const percentage = (count / analyticsData.totals.totalBags) * 100;
                      return (
                        <div key={bagType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium text-gray-900 capitalize">{bagType}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">{count} bags</div>
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
                          data={processedData.bagType}
                          title="Bag Type Distribution"
                          description="Distribution of bag types (jute vs leno)"
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
                        <div className="text-2xl font-bold text-blue-600">{analyticsData.totals.totalBags}</div>
                        <div className="text-xs text-gray-600">Total Bags</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{analyticsData.distributions.summary.uniqueVarieties}</div>
                        <div className="text-xs text-gray-600">Varieties</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{analyticsData.distributions.summary.uniqueGenerations}</div>
                        <div className="text-xs text-gray-600">Generations</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{analyticsData.distributions.summary.uniqueGraders}</div>
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
                            <td className="px-4 py-4 text-sm text-gray-900">{size.quantityRemoved}</td>
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
