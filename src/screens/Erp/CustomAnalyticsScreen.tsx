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
import { formatNumber } from '@/lib/utils';


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
    varieties: ["Himalini", "B101", "K. Jyoti"],
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
  const [stockType, setStockType] = useState<'current' | 'initial' | 'outgoing'>('current');


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

    // Calculate total bags based on stock type
    const totalBags = stockType === 'current' ? totals.totalCurrentBags : totals.totalBags;

    return {
      variety: convertDistributionToChartData(distributions.varietyDistribution, totalBags),
      generation: convertDistributionToChartData(distributions.generationDistribution, totalBags),
      rouging: convertDistributionToChartData(distributions.rougingDistribution, totalBags),
      tuberType: convertDistributionToChartData(distributions.tuberTypeDistribution, totalBags),
      grader: convertDistributionToChartData(distributions.graderDistribution, totalBags),
      bagType: convertDistributionToChartData(distributions.bagTypeDistribution, totalBags),
      bagSizeCategory: convertDistributionToChartData(distributions.bagSizeDistribution, totalBags),
      weighedStatus: convertDistributionToChartData(distributions.weighedStatusDistribution, totalBags),
      totalBags: totalBags
    };
  }, [analyticsData, stockType]);

  return (
    <>
      <TopBar title="Custom Analytics" isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
        {/* Filter Section */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                    Filter Analytics Data
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    Apply filters to customize your analytics view
                  </p>
                </div>
              </div>
              {hasActiveFilters && (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 self-start sm:self-auto"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Clear All ({activeFiltersCount})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-5">

              {/* Filter Status */}
              {hasActiveFilters && (
                <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-100 rounded">
                      <Filter className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-800">
                      {activeFiltersCount} {activeFiltersCount === 1 ? 'Filter' : 'Filters'} Active
                    </span>
                  </div>
                </div>
              )}

              {/* Filter Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                {/* Variety */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filterData.dateFrom}
                    onChange={(e) => updateFilterData('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filterData.dateTo}
                    onChange={(e) => updateFilterData('dateTo', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Error Message */}
              {analyticsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-1 bg-red-100 rounded">
                      <X className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        {analyticsError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleAnalyticsSearch}
                  disabled={isLoadingAnalytics}
                  className="bg-primary hover:bg-primary/90 text-white px-3 sm:px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
                  size="lg"
                >
                  {isLoadingAnalytics ? (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                      <span className="text-sm sm:text-base">Analyzing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <BarChart3 className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Analytics</span>
                    </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
              <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <div className="p-1 sm:p-1.5 bg-blue-50 rounded-lg flex-shrink-0">
                          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                        </div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate">
                          Total Bags
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                        {formatNumber(stockType === 'current' ? analyticsData.totals.totalCurrentBags : analyticsData.totals.totalBags)}
                      </h3>
                      <p className="text-xs text-gray-500 leading-tight">
                        {stockType === 'current' ? 'Currently in storage' : 'Initial bags received'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <div className="p-1 sm:p-1.5 bg-green-50 rounded-lg flex-shrink-0">
                          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                        </div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate">
                          {stockType === 'current' ? 'Removed Stock' : 'Current Stock'}
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                        {formatNumber(stockType === 'current' ? analyticsData.totals.totalRemovedBags : analyticsData.totals.totalCurrentBags)}
                      </h3>
                      <p className="text-xs text-gray-500 leading-tight">
                        {stockType === 'current' ? 'Bags taken out' : 'Currently in storage'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <div className="p-1 sm:p-1.5 bg-red-50 rounded-lg flex-shrink-0">
                          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                        </div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate">
                          {stockType === 'current' ? 'Initial Stock' : 'Removed Bags'}
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                        {formatNumber(stockType === 'current' ? analyticsData.totals.totalBags : analyticsData.totals.totalRemovedBags)}
                      </h3>
                      <p className="text-xs text-gray-500 leading-tight">
                        {stockType === 'current' ? 'Initial bags received' : 'Bags taken out'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <div className="p-1 sm:p-1.5 bg-purple-50 rounded-lg flex-shrink-0">
                          <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                        </div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate">
                          Varieties
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{formatNumber(analyticsData.distributions.summary.uniqueVarieties)}</h3>
                      <p className="text-xs text-gray-500 leading-tight">
                        Different varieties
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <div className="p-1 sm:p-1.5 bg-orange-50 rounded-lg flex-shrink-0">
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                        </div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate">
                          Total Orders
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{formatNumber(analyticsData.orderCounts.totalOrders)}</h3>
                      <p className="text-xs text-gray-500 leading-tight">
                        Incoming: {formatNumber(analyticsData.orderCounts.totalIncomingOrders)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                        <div className="p-1 sm:p-1.5 bg-indigo-50 rounded-lg flex-shrink-0">
                          <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                        </div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate">
                          Weighed Status
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{formatNumber(analyticsData.distributions.summary.weighedStatusCounts.weighed)}</h3>
                      <p className="text-xs text-gray-500 leading-tight">
                        Weighed: {formatNumber(analyticsData.distributions.summary.weighedStatusCounts.weighed)} | Unweighed: {formatNumber(analyticsData.distributions.summary.weighedStatusCounts.unweighed)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stock Summary Table */}
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                      Stock Summary by Variety
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                      View stock quantities by current inventory, initial quantities, or outgoing quantities
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-4 sm:px-6" aria-label="Tabs">
                    <button
                      onClick={() => setStockType('current')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        stockType === 'current'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Current ({formatNumber(analyticsData.totals.totalCurrentBags)})
                    </button>
                    <button
                      onClick={() => setStockType('initial')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        stockType === 'initial'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Initial ({formatNumber(analyticsData.totals.totalBags)})
                    </button>
                    <button
                      onClick={() => setStockType('outgoing')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        stockType === 'outgoing'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Outgoing ({formatNumber(analyticsData.totals.totalRemovedBags)})
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-0">
                {(() => {
                  // Calculate filtered sizes once - show sizes that have values based on stockType
                  const filteredSizes = bagSizeOptions.filter(size => {
                    return analyticsData.stockSummary.some(variety => {
                      const sizeData = variety.sizes.find(s => s.size === size);
                      if (!sizeData) return false;
                      switch (stockType) {
                        case 'current':
                          return sizeData.currentQuantity > 0;
                        case 'initial':
                          return sizeData.initialQuantity > 0;
                        case 'outgoing':
                          return (sizeData.initialQuantity - sizeData.currentQuantity) > 0;
                        default:
                          return sizeData.currentQuantity > 0;
                      }
                    });
                  });

                  // Helper function to get quantity for a specific bag size and variety
                  const getQuantityForSize = (variety: typeof analyticsData.stockSummary[0], sizeName: string) => {
                    const sizeData = variety.sizes.find(s => s.size === sizeName);
                    if (!sizeData) return 0;
                    switch (stockType) {
                      case 'current':
                        return sizeData.currentQuantity;
                      case 'initial':
                        return sizeData.initialQuantity;
                      case 'outgoing':
                        return sizeData.initialQuantity - sizeData.currentQuantity;
                      default:
                        return sizeData.currentQuantity;
                    }
                  };

                  // Helper function to calculate total for a specific bag size across all varieties
                  const getTotalForSize = (sizeName: string) => {
                    return analyticsData.stockSummary.reduce((total, variety) => {
                      return total + getQuantityForSize(variety, sizeName);
                    }, 0);
                  };

                  // Helper function to calculate variety total
                  const calculateVarietyTotal = (variety: typeof analyticsData.stockSummary[0]) => {
                    return filteredSizes.reduce((total, size) => {
                      return total + getQuantityForSize(variety, size);
                    }, 0);
                  };

                  return (
                    <div className="overflow-x-auto">
                      <div className="min-w-full inline-block align-middle">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 border-r whitespace-nowrap">
                                Varieties
                              </th>
                              {filteredSizes.map(size => (
                                <th key={size} className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900 border-r whitespace-nowrap">
                                  {size}
                                </th>
                              ))}
                              <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900 bg-blue-50 whitespace-nowrap">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {analyticsData.stockSummary
                              .sort((a, b) => a.variety.localeCompare(b.variety))
                              .map((variety, index) => {
                                const varietyTotal = calculateVarietyTotal(variety);

                                return (
                                  <tr key={variety.variety} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-medium text-gray-900 border-r text-xs sm:text-sm">
                                      <div className="truncate max-w-[120px] sm:max-w-none" title={variety.variety}>
                                        {variety.variety}
                                      </div>
                                    </td>
                                    {filteredSizes.map(size => {
                                      const quantity = getQuantityForSize(variety, size);

                                      return (
                                        <td
                                          key={size}
                                          className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-center text-gray-700 border-r text-xs sm:text-sm"
                                        >
                                          {quantity > 0 ? formatNumber(quantity) : '-'}
                                        </td>
                                      );
                                    })}
                                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center font-bold text-blue-600 bg-blue-50 text-xs sm:text-sm">
                                      {varietyTotal > 0 ? formatNumber(varietyTotal) : '-'}
                                    </td>
                                  </tr>
                                );
                              })}
                            {/* Totals Row */}
                            <tr className="bg-gray-100 font-bold">
                              <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-900 border-r text-xs sm:text-sm">
                                Bag Total
                              </td>
                              {filteredSizes.map(size => {
                                const sizeTotal = getTotalForSize(size);
                                return (
                                  <td key={size} className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-center text-gray-900 border-r text-xs sm:text-sm">
                                    {sizeTotal > 0 ? formatNumber(sizeTotal) : '-'}
                                  </td>
                                );
                              })}
                              <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-blue-600 bg-blue-100 text-xs sm:text-sm">
                                {formatNumber(
                                  stockType === 'current'
                                    ? analyticsData.totals.totalCurrentBags
                                    : stockType === 'initial'
                                    ? analyticsData.totals.totalBags
                                    : analyticsData.totals.totalRemovedBags
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Visualization Section */}
            {processedData && processedData.totalBags > 0 && (
              <div className="space-y-4 sm:space-y-6">
                {/* Header Controls */}
                <Card className="bg-white border border-gray-100 shadow-sm">
                  <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg flex-shrink-0">
                          <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                            Data Distribution Analysis
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                            Visual breakdown across different parameters
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setChartType(chartType === 'pie' ? 'bar' : 'pie')}
                          className="flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
                        >
                          {chartType === 'pie' ? <BarChart3 className="h-4 w-4" /> : <PieChartIcon className="h-4 w-4" />}
                          <span className="hidden sm:inline">{chartType === 'pie' ? 'Bar Chart' : 'Pie Chart'}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCharts(!showCharts)}
                          className="flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
                        >
                          {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="hidden sm:inline">{showCharts ? 'Hide' : 'Show'}</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {showCharts && (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-5">
                    <Card className="bg-white border border-gray-100 shadow-sm">
                      <CardContent className="p-2 sm:p-3">
                        <div className="overflow-x-auto">
                          <TabsList className="inline-flex w-max bg-gray-100 p-1 gap-1">
                            <TabsTrigger
                              value="overview"
                              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm font-medium py-2.5 px-4 whitespace-nowrap flex-shrink-0"
                            >
                              Overview
                            </TabsTrigger>
                            <TabsTrigger
                              value="variety"
                              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm font-medium py-2.5 px-4 whitespace-nowrap flex-shrink-0"
                            >
                              Variety
                            </TabsTrigger>
                            <TabsTrigger
                              value="quality"
                              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm font-medium py-2.5 px-4 whitespace-nowrap flex-shrink-0"
                            >
                              Quality
                            </TabsTrigger>
                            <TabsTrigger
                              value="status"
                              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm font-medium py-2.5 px-4 whitespace-nowrap flex-shrink-0"
                            >
                              Status
                            </TabsTrigger>
                          </TabsList>
                        </div>
                      </CardContent>
                    </Card>

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
                <Card className="bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50 border border-blue-200/50 shadow-sm">
                  <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-200/30">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-blue-900">
                        Quick Summary
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                      <div className="text-center p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                          {formatNumber(stockType === 'current' ? analyticsData.totals.totalCurrentBags : analyticsData.totals.totalBags)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 font-medium">
                          {stockType === 'current' ? 'Current Bags' : 'Total Bags'}
                        </div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
                        <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">{formatNumber(analyticsData.distributions.summary.uniqueVarieties)}</div>
                        <div className="text-xs sm:text-sm text-gray-600 font-medium">Varieties</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
                        <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">{formatNumber(analyticsData.distributions.summary.uniqueGenerations)}</div>
                        <div className="text-xs sm:text-sm text-gray-600 font-medium">Generations</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
                        <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">{formatNumber(analyticsData.distributions.summary.uniqueGraders)}</div>
                        <div className="text-xs sm:text-sm text-gray-600 font-medium">Graders</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* View Vouchers Button */}
            <Card className="bg-gradient-to-br from-gray-50 to-blue-50/30 border border-gray-100 shadow-sm">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <Package className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold">View Detailed Orders</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    View all order vouchers matching your current filter criteria
                  </p>
                  <Button
                    onClick={handleViewVouchers}
                    disabled={isLoadingOrders}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    size="lg"
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
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Vouchers Section */}
        {showVouchers && (
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg flex-shrink-0">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                    Related Order Vouchers
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    {isLoadingOrders
                      ? "Loading vouchers..."
                      : `Found ${orders.length} voucher${orders.length !== 1 ? 's' : ''} matching your filters`
                    }
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowVouchers(false)}
                variant="outline"
                size="sm"
                className="hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
              {isLoadingOrders ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mb-4" />
                <p className="text-sm sm:text-base text-gray-600 font-medium">Loading vouchers...</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Please wait while we fetch your data</p>
              </div>
            ) : ordersError ? (
              <div className="text-center py-12 sm:py-16">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 mb-4">
                    <Package className="h-8 w-8 sm:h-10 sm:w-10 text-red-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-6">
                    {ordersError.message || 'No orders match your current filter criteria. Try changing your filters.'}
                  </p>
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    size="default"
                    className="text-primary hover:text-primary hover:bg-primary/5 border-primary/30"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 mb-4">
                    <Package className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Vouchers Found</h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-6">
                    No vouchers match your current filter criteria. Try adjusting your filters or clear all filters to see all vouchers.
                  </p>
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    size="default"
                    className="text-primary hover:text-primary hover:bg-primary/5 border-primary/30"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
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
