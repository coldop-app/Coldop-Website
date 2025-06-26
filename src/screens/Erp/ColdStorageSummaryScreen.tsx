import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import TopBar from '@/components/common/Topbar/Topbar';
import { Package, Boxes, TrendingUp, Warehouse, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { StoreAdmin } from '@/utils/types';

interface StockSummary {
  variety: string;
  sizes: {
    size: string;
    initialQuantity: number;
    currentQuantity: number;
  }[];
}

interface StockSummaryResponse {
  status: string;
  stockSummary: StockSummary[];
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

  const stockSummary = (stockData as StockSummaryResponse)?.stockSummary || [];
  const totalBags = calculateTotalBags(stockSummary);

  return (
    <>
      <TopBar title={t('coldStorageSummary.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">

        {/* Cold Storage Branding Card */}
        <Card className="overflow-hidden border border-gray-100 shadow-sm">
          {/* Header Background */}
          <div className="bg-gray-50/50 border-b border-gray-100 px-6 sm:px-8 pt-6 sm:pt-8 pb-6">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
              {/* Logo/Avatar */}
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 border-4 border-white shadow-md">
                  {adminInfo?.imageUrl ? (
                    <AvatarImage src={adminInfo.imageUrl} alt={adminInfo.coldStorageDetails?.coldStorageName || adminInfo.name} />
                  ) : null}
                  <AvatarFallback className="text-xl sm:text-2xl lg:text-3xl bg-primary text-white font-bold">
                    {getInitials(adminInfo?.coldStorageDetails?.coldStorageName || adminInfo?.name || 'CS')}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Cold Storage Info */}
              <div className="flex-1 w-full text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                  {adminInfo?.coldStorageDetails?.coldStorageName || adminInfo?.name || 'Cold Storage'}
                </h1>
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6 mb-6">
                  {adminInfo?.coldStorageDetails?.coldStorageAddress && (
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600">
                      <MapPin size={16} className="text-primary" />
                      <span className="text-sm sm:text-base">{adminInfo.coldStorageDetails.coldStorageAddress}</span>
                    </div>
                  )}
                  {adminInfo?.name && (
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600">
                      <User size={16} className="text-primary" />
                      <span className="text-sm sm:text-base">{adminInfo.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <CardContent className="p-6 sm:p-8 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Total Varieties */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Warehouse size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {t('coldStorageSummary.totalVarieties')}
                    </div>
                    <div className="font-bold text-2xl text-primary">{stockSummary.length}</div>
                  </div>
                </div>
              </div>

              {/* Total Bags */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {t('coldStorageSummary.totalBags')}
                    </div>
                    <div className="font-bold text-2xl text-primary">{totalBags}</div>
                  </div>
                </div>
              </div>

              {/* Bag Types */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Boxes size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Bag Types
                    </div>
                    <div className="font-bold text-2xl text-gray-900">
                      {adminInfo?.preferences?.bagSizes?.length || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Status
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${adminInfo?.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="font-medium text-gray-900 text-sm">
                        {adminInfo?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Summary Section */}
        <Card className="overflow-hidden border border-gray-100 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-primary" />
                <CardTitle className="text-base sm:text-lg md:text-xl">{t('coldStorageSummary.stockSummary')}</CardTitle>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <Boxes size={14} className="sm:w-4 sm:h-4" />
                <span>{stockSummary.length} varieties stored</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 bg-white">
            {isStockLoading ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 sm:h-24" />
                  ))}
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-6 sm:h-8 w-1/3" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <Skeleton key={j} className="h-20 sm:h-24" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : stockSummary.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Package size={48} className="text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Stock Available</h3>
                <p className="text-gray-500">Your cold storage is currently empty. Add some stock to get started.</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {stockSummary.map((variety) => {
                    const totalBags = calculateVarietyTotal(variety.sizes);
                    return (
                      <div
                        key={variety.variety}
                        className="bg-gray-50/50 border border-gray-100 rounded-xl p-3 sm:p-4 hover:shadow-sm transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          const element = document.getElementById(`variety-${variety.variety}`);
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <span className="font-medium text-gray-900 text-xs sm:text-sm md:text-base truncate">{variety.variety}</span>
                          <span className="text-primary font-bold text-xs sm:text-sm md:text-base">{totalBags}</span>
                        </div>
                        <div className="text-[10px] sm:text-xs md:text-sm text-gray-500">{t('coldStorageSummary.totalBags').toLowerCase()}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Cards */}
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  {stockSummary.map((variety) => {
                    const totalBags = calculateVarietyTotal(variety.sizes);
                    return (
                      <Card key={variety.variety} id={`variety-${variety.variety}`} className="overflow-hidden border border-gray-100">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                            <CardTitle className="text-sm sm:text-base md:text-lg">{variety.variety}</CardTitle>
                            <div className="flex items-center gap-1 sm:gap-2 text-primary font-medium text-xs sm:text-sm md:text-base">
                              <TrendingUp size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                              <span>{t('coldStorageSummary.total')}: {totalBags} {t('coldStorageSummary.bags').toLowerCase()}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-4 md:p-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                            {variety.sizes.map((size) => (
                              <div
                                key={size.size}
                                className="bg-gray-50/50 border border-gray-100 rounded-lg p-2 sm:p-3 md:p-4 hover:shadow-sm transition-all duration-200"
                              >
                                <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">{size.size}</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] sm:text-xs text-gray-600">{t('coldStorageSummary.currentStock')}</span>
                                    <span className="font-bold text-gray-900 text-xs sm:text-sm">{size.currentQuantity}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] sm:text-xs text-gray-600">{t('coldStorageSummary.initialStock')}</span>
                                    <span className="font-medium text-gray-700 text-xs sm:text-sm">{size.initialQuantity}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ColdStorageSummaryScreen;