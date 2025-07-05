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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

interface SizeDistributionItem {
  size: string;
  quantity: number;
  percentage: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

  const stockSummary = (stockData as StockSummaryResponse)?.stockSummary || [];
  const totalBags = calculateTotalBags(stockSummary);
  const capacity = adminInfo?.coldStorageDetails?.capacity || 0;
  const utilizationPercentage = capacity > 0 ? (totalBags / capacity) * 100 : 0;

  // Prepare data for size distribution chart
  const sizeDistributionData = stockSummary.reduce((acc: SizeDistributionItem[], variety) => {
    variety.sizes.forEach(size => {
      const existingSize = acc.find(item => item.size === size.size);
      if (existingSize) {
        existingSize.quantity += size.currentQuantity;
        existingSize.percentage = (existingSize.quantity / totalBags) * 100;
      } else {
        acc.push({
          size: size.size,
          quantity: size.currentQuantity,
          percentage: (size.currentQuantity / totalBags) * 100
        });
      }
    });
    return acc;
  }, []).sort((a, b) => b.quantity - a.quantity);

  // Prepare data for top farmers chart
  const topFarmersChartData = topFarmersData?.data?.map(farmer => ({
    name: farmer.farmerName,
    totalBags: farmer.totalBags,
    ...farmer.bagSummary
  })) || [];

  // Get unique bag sizes for table headers
  const allBagSizes = [...new Set(stockSummary.flatMap(variety =>
    variety.sizes.map(size => size.size)
  ))].sort();

  if (isStockLoading || isTopFarmersLoading) {
    return (
      <>
        <TopBar title={t('coldStorageSummary.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
        <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[160px] w-full" />
            ))}
          </div>
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Cold Storage Analytics" isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6 pb-20">

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

        {/* Analytics Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inventory</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalBags}</h3>
                  <p className="text-sm text-gray-500 mt-1">Total bags stored</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {stockSummary[0] && (
            <Card className="bg-white shadow-sm border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Top Variety</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{stockSummary[0].variety}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {calculateVarietyTotal(stockSummary[0].sizes)} bags stored
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      {((calculateVarietyTotal(stockSummary[0].sizes) / totalBags) * 100).toFixed(1)}% of total inventory
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <Boxes className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {sizeDistributionData[0] && (
            <Card className="bg-white shadow-sm border-l-4 border-l-pink-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dominant Size</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{sizeDistributionData[0].size}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {sizeDistributionData[0].quantity} bags
                    </p>
                    <p className="text-xs text-pink-600 mt-1">
                      {sizeDistributionData[0].percentage.toFixed(1)}% of all bag sizes
                    </p>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-full">
                    <Package className="w-6 h-6 text-pink-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {topFarmersData?.data?.[0] && (
            <Card className="bg-white shadow-sm border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Top Farmer</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {topFarmersData.data[0].farmerName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {topFarmersData.data[0].totalBags} bags stored
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Specializes in {Object.entries(topFarmersData.data[0].bagSummary)[0]?.[0]} ({Object.entries(topFarmersData.data[0].bagSummary)[0]?.[1]} bags)
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stock Summary Table */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl font-bold text-gray-900">Stock Summary</CardTitle>
            <p className="text-sm text-gray-600">Distribution of potato varieties by size category</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-r">
                      Varieties
                    </th>
                    {allBagSizes.map(size => (
                      <th key={size} className="px-4 py-4 text-center text-sm font-semibold text-gray-900 border-r">
                        {size}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockSummary.map((variety, index) => (
                    <tr key={variety.variety} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-6 py-4 font-medium text-gray-900 border-r">
                        {variety.variety}
                      </td>
                      {allBagSizes.map(size => {
                        const sizeData = variety.sizes.find(s => s.size === size);
                        return (
                          <td key={size} className="px-4 py-4 text-center text-gray-700 border-r">
                            {sizeData ? sizeData.currentQuantity : 0}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-center font-bold text-blue-600 bg-blue-50">
                        {calculateVarietyTotal(variety.sizes)}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-gray-100 font-bold">
                    <td className="px-6 py-4 text-gray-900 border-r">
                      Bag Total
                    </td>
                    {allBagSizes.map(size => {
                      const sizeTotal = stockSummary.reduce((total, variety) => {
                        const sizeData = variety.sizes.find(s => s.size === size);
                        return total + (sizeData ? sizeData.currentQuantity : 0);
                      }, 0);
                      return (
                        <td key={size} className="px-4 py-4 text-center text-gray-900 border-r">
                          {sizeTotal}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center text-blue-600 bg-blue-100">
                      {totalBags}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Capacity Utilization */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Capacity Utilization</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">0%</span>
                <span className="font-medium text-gray-900">
                  {totalBags} / {capacity} bags ({utilizationPercentage.toFixed(1)}%)
                </span>
                <span className="text-gray-600">100%</span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div
                    className={`h-8 rounded-full transition-all duration-500 ${
                      utilizationPercentage > 90 ? 'bg-red-500' :
                      utilizationPercentage > 75 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                  />
                </div>
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 bg-white border-2 border-red-500 rounded-full px-2 py-1 text-xs font-bold text-red-600"
                  style={{ left: `${Math.min(utilizationPercentage, 100)}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                >
                  {utilizationPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{capacity - totalBags}</div>
                  <div className="text-sm text-gray-600">Available Space</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{totalBags}</div>
                  <div className="text-sm text-gray-600">Currently Stored</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{capacity}</div>
                  <div className="text-sm text-gray-600">Total Capacity</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Size Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Size Distribution</CardTitle>
              <p className="text-sm text-gray-600">Percentage breakdown by potato size</p>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sizeDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="quantity"
                      nameKey="size"
                      label={({ name, percent }) => name && percent ? `${name}: ${(percent * 100).toFixed(1)}%` : ''}
                    >
                      {sizeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} bags`, 'Quantity']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-gray-900">Size Distribution & Insights</h4>
                <div className="space-y-2">
                  {sizeDistributionData.slice(0, 3).map((item, index) => (
                    <div key={item.size} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{item.size}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.quantity} bags ({item.percentage.toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Distribution Insights</h5>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• {sizeDistributionData[0]?.size} is the most common size at {sizeDistributionData[0]?.percentage.toFixed(1)}% of all inventory</li>
                    <li>• Top 2 sizes account for {(sizeDistributionData[0]?.percentage + (sizeDistributionData[1]?.percentage || 0)).toFixed(1)}% of inventory</li>
                    {sizeDistributionData[sizeDistributionData.length - 1] && (
                      <li>• {sizeDistributionData[sizeDistributionData.length - 1].size} has the lowest inventory at {sizeDistributionData[sizeDistributionData.length - 1].percentage.toFixed(1)}%</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Farmers Chart */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Top Farmers</CardTitle>
              <p className="text-sm text-gray-600">Farmers with the highest storage inventory by bag type</p>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topFarmersChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalBags" fill="#f59e0b" name="Total Bags" />
                    {allBagSizes.map((size, index) => (
                      <Bar key={size} dataKey={size} fill={COLORS[index % COLORS.length]} name={size} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {topFarmersData?.data?.[0] && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Top Farmer Insights</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Top Contributor</p>
                        <p className="text-sm text-gray-600">{topFarmersData.data[0].farmerName}</p>
                      </div>
                      <p className="text-lg font-bold text-yellow-600">{topFarmersData.data[0].totalBags} bags</p>
                    </div>
                    {Object.entries(topFarmersData.data[0].bagSummary)[0] && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Specialty Breakdown</p>
                          <p className="text-sm text-gray-600">
                            {Object.entries(topFarmersData.data[0].bagSummary)[0][0]}: {Object.entries(topFarmersData.data[0].bagSummary)[0][1]} bags ({((Object.entries(topFarmersData.data[0].bagSummary)[0][1] / topFarmersData.data[0].totalBags) * 100).toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    )}
                    {topFarmersData.data[1] && (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Comparison</p>
                          <p className="text-sm text-gray-600">Stores {(topFarmersData.data[0].totalBags / topFarmersData.data[1].totalBags).toFixed(1)}x more than second-ranked farmer</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Storage Share</h5>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{((topFarmersData.data[0].totalBags / totalBags) * 100).toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">of total inventory</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ColdStorageSummaryScreen;