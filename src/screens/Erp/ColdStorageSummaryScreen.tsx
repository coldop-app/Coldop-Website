import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import TopBar from '@/components/common/Topbar/Topbar';
import { Package, Boxes, TrendingUp, MapPin, User, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { StoreAdmin } from '@/utils/types';
import StockSummaryTable, { StockSummary as StockSummaryType, TabType } from '@/components/common/StockSummaryTable';

// Lazy load heavy chart components
const StockTrendChart = lazy(() => import('@/components/charts/StockTrendChart'));
const VarietyDistributionChart = lazy(() => import('@/components/charts/VarietyDistributionChart'));
const TopFarmersChart = lazy(() => import('@/components/charts/TopFarmersChart'));
import { formatNumber } from '@/lib/utils';

interface StockTrendItem {
  date: string;
  currentStockAtThatTime: number;
  type: 'incoming' | 'outgoing';
  voucherNumber: number;
}

interface StockSummaryResponse {
  status: string;
  stockSummary: StockSummaryType[];
  stockTrend: StockTrendItem[];
}






const calculateVarietyTotal = (sizes: StockSummaryType['sizes'], tabType: TabType = 'current') => {
  return sizes.reduce((acc: number, size: StockSummaryType['sizes'][0]) => {
    switch (tabType) {
      case 'current':
        return acc + size.currentQuantity;
      case 'initial':
        return acc + size.initialQuantity;
      case 'outgoing':
        return acc + (size.quantityRemoved || 0);
      default:
        return acc + size.currentQuantity;
    }
  }, 0);
};

const calculateTotalBags = (stockSummary: StockSummaryType[], tabType: TabType = 'current') => {
  return stockSummary.reduce((total, variety) => {
    return total + calculateVarietyTotal(variety.sizes, tabType);
  }, 0);
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const ColdStorageSummaryScreen = () => {
  const { t } = useTranslation();
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo) as StoreAdmin | null;
  const [activeTab, setActiveTab] = useState<TabType>('current');

  const { data: stockData, isLoading: isStockLoading } = useQuery({
    queryKey: ['coldStorageSummary', adminInfo?.token],
    queryFn: () => storeAdminApi.getColdStorageSummary(adminInfo?.token || ''),
    enabled: !!adminInfo?.token,
  });

  const { data: topFarmersData, isLoading: isTopFarmersLoading } = useQuery({
    queryKey: ['topFarmers', adminInfo?.token],
    queryFn: () => storeAdminApi.getTopFarmers(adminInfo?.token || ''),
    enabled: !!adminInfo?.token,
  });

  const stockResponse = stockData as StockSummaryResponse;
  const stockSummary = stockResponse?.stockSummary || [];
  const stockTrend = stockResponse?.stockTrend || [];
  const totalBags = calculateTotalBags(stockSummary, activeTab);
  const capacity = adminInfo?.coldStorageDetails?.capacity || 0;
  const utilizationPercentage = capacity > 0 ? (totalBags / capacity) * 100 : 0;

  // Calculate totals for each tab
  const currentTotal = calculateTotalBags(stockSummary, 'current');
  const initialTotal = calculateTotalBags(stockSummary, 'initial');
  const outgoingTotal = calculateTotalBags(stockSummary, 'outgoing');

  // Prepare data for variety distribution chart (top 5 varieties + others)
  const varietyDistributionData = stockSummary
    .map(variety => ({
      variety: variety.variety,
      quantity: calculateVarietyTotal(variety.sizes, activeTab),
      percentage: (calculateVarietyTotal(variety.sizes, activeTab) / totalBags) * 100
    }))
    .sort((a, b) => b.quantity - a.quantity);

  // Get top 5 varieties and group rest as "Others"
  const top5Varieties = varietyDistributionData.slice(0, 5);
  const othersQuantity = varietyDistributionData.slice(5).reduce((sum, variety) => sum + variety.quantity, 0);
  const othersPercentage = (othersQuantity / totalBags) * 100;

  const finalVarietyDistribution = [
    ...top5Varieties,
    ...(othersQuantity > 0 ? [{
      variety: 'Others',
      quantity: othersQuantity,
      percentage: othersPercentage
    }] : [])
  ];

  // Prepare data for top farmers chart (only total bags)
  const topFarmersChartData = topFarmersData?.data?.map(farmer => ({
    name: farmer.farmerName,
    totalBags: farmer.totalBags
  })) || [];



  if (isStockLoading || isTopFarmersLoading) {
    return (
      <>
        <TopBar title={t('coldStorageSummary.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
        <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[140px] sm:h-[160px] w-full" />
            ))}
          </div>
          <Skeleton className="h-[300px] sm:h-[400px] w-full" />
          <Skeleton className="h-[300px] sm:h-[400px] w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={t('coldStorageSummary.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">

        {/* Cold Storage Branding Card */}
        <Card className="overflow-hidden border border-gray-100 shadow-sm">
          {/* Header Background */}
          <div className="bg-gray-50/50 border-b border-gray-100 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6 lg:gap-8">
              {/* Logo/Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 xl:h-28 xl:w-28 border-4 border-white shadow-md">
                  {adminInfo?.imageUrl ? (
                    <AvatarImage src={adminInfo.imageUrl} alt={adminInfo.coldStorageDetails?.coldStorageName || adminInfo.name} />
                  ) : null}
                  <AvatarFallback className="text-sm sm:text-xl lg:text-2xl xl:text-3xl bg-primary text-white font-bold">
                    {getInitials(adminInfo?.coldStorageDetails?.coldStorageName || adminInfo?.name || 'CS')}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Cold Storage Info */}
              <div className="flex-1 w-full text-center lg:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                  {adminInfo?.coldStorageDetails?.coldStorageName || adminInfo?.name || 'Cold Storage'}
                </h1>
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row sm:items-center lg:items-start xl:items-center gap-2 sm:gap-4 lg:gap-2 xl:gap-6 mb-4 sm:mb-6">
                  {adminInfo?.coldStorageDetails?.coldStorageAddress && (
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600">
                      <MapPin size={14} className="text-primary flex-shrink-0" />
                      <span className="text-xs sm:text-sm lg:text-base text-center lg:text-left break-words">
                        {adminInfo.coldStorageDetails.coldStorageAddress}
                      </span>
                    </div>
                  )}
                  {adminInfo?.name && (
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600">
                      <User size={14} className="text-primary flex-shrink-0" />
                      <span className="text-xs sm:text-sm lg:text-base">{adminInfo.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Analytics Stats Cards */}
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
                      {activeTab === 'current' ? t('coldStorageSummary.totalInventory') :
                       activeTab === 'initial' ? 'Total Initial Stock' :
                       'Total Outgoing Stock'}
                    </p>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{formatNumber(totalBags)}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {activeTab === 'current' ? t('coldStorageSummary.totalBagsStored') :
                     activeTab === 'initial' ? 'Initial bags received' :
                     'Bags removed/outgoing'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {stockSummary.length > 0 && (() => {
            // Find the variety with the highest total bags
            const topVariety = [...stockSummary].sort((a, b) =>
              calculateVarietyTotal(b.sizes, activeTab) - calculateVarietyTotal(a.sizes, activeTab)
            )[0];

            const topVarietyTotal = calculateVarietyTotal(topVariety.sizes, activeTab);
            const topVarietyPercentage = (topVarietyTotal / totalBags) * 100;

            return (
              <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg flex-shrink-0">
                          <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                          {t('coldStorageSummary.topVariety')}
                        </p>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">{topVariety.variety}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        {formatNumber(topVarietyTotal)} {t('coldStorageSummary.bagsStored')}
                      </p>
                      <p className="text-xs text-purple-600 font-medium">
                        {topVarietyPercentage.toFixed(1)}% {t('coldStorageSummary.ofTotalInventory')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {finalVarietyDistribution[1] && (
            <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
              <CardContent className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 bg-pink-50 rounded-lg flex-shrink-0">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                        {t('coldStorageSummary.secondVariety')}
                      </p>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{finalVarietyDistribution[1].variety}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      {formatNumber(finalVarietyDistribution[1].quantity)} {t('coldStorageSummary.bags')}
                    </p>
                    <p className="text-xs text-pink-600 font-medium">
                      {finalVarietyDistribution[1].percentage.toFixed(1)}% {t('coldStorageSummary.ofAllVarieties')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {topFarmersData?.data?.[0] && (
            <Card className="bg-gray-50/50 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
              <CardContent className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg flex-shrink-0">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                        {t('coldStorageSummary.topFarmer')}
                      </p>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">
                      {topFarmersData.data[0].farmerName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      {formatNumber(topFarmersData.data[0].totalBags)} {t('coldStorageSummary.bagsStored')}
                    </p>
                    <p className="text-xs text-green-600 font-medium truncate">
                      {t('coldStorageSummary.specializesIn')} {Object.entries(topFarmersData.data[0].bagSummary)[0]?.[0]} ({Object.entries(topFarmersData.data[0].bagSummary)[0]?.[1]} {t('coldStorageSummary.bags')})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stock Summary Tabs */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Stock Summary</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                  View stock quantities by current inventory, initial quantities, or outgoing quantities.
                </p>
              </div>
              <Link
                to="/erp/custom-analytics"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
                title="Custom Analytics"
              >
                <BarChart3 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                <span className="hidden sm:inline">Custom Analytics</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-4 sm:px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'current'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Current ({formatNumber(currentTotal)})
                </button>
                <button
                  onClick={() => setActiveTab('initial')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'initial'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Initial ({formatNumber(initialTotal)})
                </button>
                <button
                  onClick={() => setActiveTab('outgoing')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'outgoing'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Outgoing ({formatNumber(outgoingTotal)})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-0">
              <StockSummaryTable stockSummary={stockSummary} tabType={activeTab} />
            </div>
          </CardContent>
        </Card>

        {/* Capacity Utilization */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
              {activeTab === 'current' ? t('coldStorageSummary.capacityUtilization') :
               activeTab === 'initial' ? 'Initial Stock Overview' :
               'Outgoing Stock Overview'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">0%</span>
                <span className="font-medium text-gray-900 text-center">
                  {formatNumber(totalBags)} / {formatNumber(capacity)} bags ({utilizationPercentage.toFixed(1)}%)
                </span>
                <span className="text-gray-600">100%</span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-6 sm:h-8">
                  <div
                    className={`h-6 sm:h-8 rounded-full transition-all duration-500 ${
                      utilizationPercentage > 90 ? 'bg-red-500' :
                      utilizationPercentage > 75 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                  />
                </div>
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 bg-white border-2 border-red-500 rounded-full px-1 sm:px-2 py-0.5 sm:py-1 text-xs font-bold text-red-600 whitespace-nowrap"
                  style={{ left: `${Math.min(utilizationPercentage, 100)}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                >
                  {utilizationPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatNumber(activeTab === 'current' ? capacity - totalBags :
                     activeTab === 'initial' ? capacity - totalBags :
                     totalBags)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {activeTab === 'current' ? t('coldStorageSummary.availableSpace') :
                     activeTab === 'initial' ? 'Remaining Capacity' :
                     'Total Outgoing'}
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{formatNumber(totalBags)}</div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {activeTab === 'current' ? t('coldStorageSummary.currentlyStored') :
                     activeTab === 'initial' ? 'Initial Stock' :
                     'Outgoing Stock'}
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{formatNumber(capacity)}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{t('coldStorageSummary.totalCapacity')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Trend Chart */}
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
          <StockTrendChart data={stockTrend} currentStock={totalBags} />
        </Suspense>

                {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <VarietyDistributionChart data={finalVarietyDistribution} />
          </Suspense>
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <TopFarmersChart
              data={topFarmersChartData}
              topFarmersData={topFarmersData}
              totalBags={currentTotal}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default ColdStorageSummaryScreen;