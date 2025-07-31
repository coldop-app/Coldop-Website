import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import TopBar from '@/components/common/Topbar/Topbar';
import { Package, Boxes, TrendingUp, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { StoreAdmin } from '@/utils/types';
import StockTrendChart from '@/components/charts/StockTrendChart';
import VarietyDistributionChart from '@/components/charts/VarietyDistributionChart';
import TopFarmersChart from '@/components/charts/TopFarmersChart';
import StockSummaryTable from '@/components/common/StockSummaryTable';

interface StockSummary {
  variety: string;
  sizes: {
    size: string;
    initialQuantity: number;
    currentQuantity: number;
  }[];
}

interface StockTrendItem {
  month: string;
  totalStock: number;
}

interface StockSummaryResponse {
  status: string;
  stockSummary: StockSummary[];
  stockTrend: StockTrendItem[];
}






const calculateVarietyTotal = (sizes: StockSummary['sizes']) => {
  return sizes.reduce((acc, size) => acc + size.currentQuantity, 0);
};

const calculateTotalBags = (stockSummary: StockSummary[]) => {
  return stockSummary.reduce((total, variety) => {
    return total + variety.sizes.reduce((sum, size) => sum + size.currentQuantity, 0);
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
  const totalBags = calculateTotalBags(stockSummary);
  const capacity = adminInfo?.coldStorageDetails?.capacity || 0;
  const utilizationPercentage = capacity > 0 ? (totalBags / capacity) * 100 : 0;

  // Prepare data for variety distribution chart (top 5 varieties + others)
  const varietyDistributionData = stockSummary
    .map(variety => ({
      variety: variety.variety,
      quantity: calculateVarietyTotal(variety.sizes),
      percentage: (calculateVarietyTotal(variety.sizes) / totalBags) * 100
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
                      {t('coldStorageSummary.totalInventory')}
                    </p>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{totalBags}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{t('coldStorageSummary.totalBagsStored')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {stockSummary.length > 0 && (() => {
            // Find the variety with the highest total bags
            const topVariety = [...stockSummary].sort((a, b) =>
              calculateVarietyTotal(b.sizes) - calculateVarietyTotal(a.sizes)
            )[0];

            const topVarietyTotal = calculateVarietyTotal(topVariety.sizes);
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
                        {topVarietyTotal} {t('coldStorageSummary.bagsStored')}
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
                      {finalVarietyDistribution[1].quantity} {t('coldStorageSummary.bags')}
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
                      {topFarmersData.data[0].totalBags} {t('coldStorageSummary.bagsStored')}
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

        {/* Stock Summary Table */}
        <StockSummaryTable stockSummary={stockSummary} />

        {/* Capacity Utilization */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">{t('coldStorageSummary.capacityUtilization')}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">0%</span>
                <span className="font-medium text-gray-900 text-center">
                  {totalBags} / {capacity} bags ({utilizationPercentage.toFixed(1)}%)
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
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{capacity - totalBags}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{t('coldStorageSummary.availableSpace')}</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{totalBags}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{t('coldStorageSummary.currentlyStored')}</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{capacity}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{t('coldStorageSummary.totalCapacity')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Trend Chart */}
        <StockTrendChart data={stockTrend} currentStock={totalBags} />

                {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <VarietyDistributionChart data={finalVarietyDistribution} />
          <TopFarmersChart
            data={topFarmersChartData}
            topFarmersData={topFarmersData}
            totalBags={totalBags}
          />
        </div>
      </div>
    </>
  );
};

export default ColdStorageSummaryScreen;