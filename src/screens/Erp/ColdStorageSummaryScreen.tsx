import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import TopBar from '@/components/common/Topbar/Topbar';
import { Package, Boxes, TrendingUp, Warehouse } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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

const ColdStorageSummaryScreen = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  const { data: stockData, isLoading: isStockLoading } = useQuery({
    queryKey: ['coldStorageSummary', adminInfo?.token],
    queryFn: () => storeAdminApi.getColdStorageSummary(adminInfo?.token || ''),
    enabled: !!adminInfo?.token,
  });

  const stockSummary = (stockData as StockSummaryResponse)?.stockSummary || [];
  const totalBags = calculateTotalBags(stockSummary);

  return (
    <>
      <TopBar title="Cold Storage Summary" isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
        {/* Overview Card */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
              <div className="flex-1 w-full text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Cold Storage Overview</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Warehouse size={18} className="text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500">Total Varieties</div>
                      <div className="font-bold text-lg text-primary">{stockSummary.length}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Package size={18} className="text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500">Total Bags</div>
                      <div className="font-bold text-lg text-primary">{totalBags}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Summary Section */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-primary" />
              <CardTitle className="text-lg md:text-xl">Stock Summary</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Boxes size={16} />
              <span>Total Varieties: {stockSummary.length}</span>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {isStockLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-8 w-1/3" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <Skeleton key={j} className="h-24" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {stockSummary.map((variety) => {
                    const totalBags = calculateVarietyTotal(variety.sizes);
                    return (
                      <div
                        key={variety.variety}
                        className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => {
                          const element = document.getElementById(`variety-${variety.variety}`);
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{variety.variety}</span>
                          <span className="text-primary font-semibold text-sm sm:text-base">{totalBags}</span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">Total Bags</div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Cards */}
                <div className="space-y-4 sm:space-y-6">
                  {stockSummary.map((variety) => {
                    const totalBags = calculateVarietyTotal(variety.sizes);
                    return (
                      <Card key={variety.variety} id={`variety-${variety.variety}`} className="overflow-hidden">
                        <CardHeader className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                            <CardTitle className="text-base sm:text-lg">{variety.variety}</CardTitle>
                            <div className="flex items-center gap-2 text-primary font-medium text-sm sm:text-base">
                              <TrendingUp size={16} />
                              <span>Total: {totalBags} bags</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                            {variety.sizes.map((size) => (
                              <div
                                key={size.size}
                                className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors"
                              >
                                <div className="text-sm font-medium text-gray-500 mb-2">{size.size}</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs sm:text-sm text-gray-600">Current Stock</span>
                                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{size.currentQuantity}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs sm:text-sm text-gray-600">Initial Stock</span>
                                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{size.initialQuantity}</span>
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