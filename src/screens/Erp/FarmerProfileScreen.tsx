import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import TopBar from '@/components/common/Topbar/Topbar';
import { Phone, MapPin, Calendar, Package, Boxes, TrendingUp, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  createdAt: string;
  imageUrl?: string;
}

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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const calculateVarietyTotal = (sizes: StockSummary['sizes']) => {
  return sizes.reduce((acc, size) => acc + size.currentQuantity, 0);
};

const calculateFarmerTotalBags = (stockSummary: StockSummary[]) => {
  return stockSummary.reduce((total, variety) => {
    return total + variety.sizes.reduce((sum, size) => sum + size.currentQuantity, 0);
  }, 0);
};

const FarmerProfileScreen = () => {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const farmer = location.state?.farmer as Farmer;
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  const { data: stockData, isLoading: isStockLoading } = useQuery({
    queryKey: ['farmerStock', id, adminInfo?.token],
    queryFn: () => storeAdminApi.getFarmerStockSummary(id || '', adminInfo?.token || ''),
    enabled: !!id && !!adminInfo?.token,
  });

  const stockSummary = (stockData as StockSummaryResponse)?.stockSummary || [];

  const totalBags = calculateFarmerTotalBags(stockSummary);

  if (!farmer) {
    return (
      <>
        <TopBar title="Farmer Profile" isSidebarOpen={false} setIsSidebarOpen={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-red-500">Farmer information not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Farmer Profile" isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
        {/* Personal Information Card */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
              {/* Avatar */}
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                <AvatarFallback className="text-xl md:text-2xl bg-primary/10 text-primary">
                  {getInitials(farmer.name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">{farmer.name}</h1>
                  <div className="flex items-center justify-center md:justify-end gap-3">
                    <Button
                      onClick={() => navigate(`/erp/incoming-order`, { state: { farmer } })}
                      variant="outline"
                      className="bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-900"
                    >
                      <ArrowDownCircle className="mr-2 h-4 w-4 text-primary" />
                      Incoming Order
                    </Button>
                    <Button
                      onClick={() => navigate(`/erp/orders/outgoing/create`, { state: { farmer } })}
                      variant="outline"
                      className="bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-900"
                    >
                      <ArrowUpCircle className="mr-2 h-4 w-4 text-primary" />
                      Outgoing Order
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Phone size={18} className="text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500">Phone Number</div>
                      <div className="font-medium truncate">{farmer.mobileNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500">Address</div>
                      <div className="font-medium line-clamp-2">{farmer.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Calendar size={18} className="text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500">Member Since</div>
                      <div className="font-medium">{new Date(farmer.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {/* Total Bags Row */}
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

export default FarmerProfileScreen;