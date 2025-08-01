import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { StoreAdmin } from '@/utils/types';

interface StockSummary {
  variety: string;
  sizes: {
    size: string;
    initialQuantity: number;
    currentQuantity: number;
  }[];
}

interface StockSummaryTableProps {
  stockSummary: StockSummary[];
}

const calculateVarietyTotal = (variety: StockSummary, allBagSizes: string[]) => {
  return allBagSizes.reduce((acc, sizeName) => {
    const sizeData = variety.sizes.find(s => s.size === sizeName);
    return acc + (sizeData ? sizeData.currentQuantity : 0);
  }, 0);
};

const calculateTotalBags = (stockSummary: StockSummary[], allBagSizes: string[]) => {
  return stockSummary.reduce((total, variety) => {
    return total + calculateVarietyTotal(variety, allBagSizes);
  }, 0);
};

const StockSummaryTable = ({ stockSummary }: StockSummaryTableProps) => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo) as StoreAdmin | null;
  const navigate = useNavigate();

  // Get all bag sizes from admin preferences for consistent table columns
  const allBagSizes = useMemo(() => {
    if (!adminInfo?.preferences?.bagSizes || adminInfo.preferences.bagSizes.length === 0) {
      // Fallback: use all unique bag sizes from the stock data
      const uniqueSizes = new Set<string>();
      stockSummary.forEach(variety => {
        variety.sizes.forEach(size => uniqueSizes.add(size.size));
      });
      return Array.from(uniqueSizes).sort();
    }
    return adminInfo.preferences.bagSizes;
  }, [adminInfo?.preferences?.bagSizes, stockSummary]);

  // Helper function to get quantity for a specific bag size and variety
  const getQuantityForSize = (variety: StockSummary, sizeName: string) => {
    const sizeData = variety.sizes.find(s => s.size === sizeName);
    return sizeData ? sizeData.currentQuantity : 0;
  };

  // Helper function to calculate total for a specific bag size across all varieties
  const getTotalForSize = (sizeName: string) => {
    return stockSummary.reduce((total, variety) => {
      return total + getQuantityForSize(variety, sizeName);
    }, 0);
  };

  // Handle cell click to navigate to variety breakdown
  const handleCellClick = (variety: StockSummary, bagSize: string) => {
    const quantity = getQuantityForSize(variety, bagSize);
    if (quantity > 0) {
      navigate('/erp/variety-breakdown', {
        state: { variety: variety.variety, bagSize }
      });
    }
  };

  // Sort varieties alphabetically
  const sortedVarieties = useMemo(() => {
    return [...stockSummary].sort((a, b) => a.variety.localeCompare(b.variety));
  }, [stockSummary]);

  const totalBags = calculateTotalBags(stockSummary, allBagSizes);

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="bg-gray-50 border-b px-4 sm:px-6 py-3 sm:py-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Stock Summary</CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">
          Distribution of potato varieties by size category. Click on any cell with quantity to view detailed breakdown.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 border-r whitespace-nowrap">
                    Varieties
                  </th>
                  {allBagSizes.map(size => (
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
                {sortedVarieties.map((variety, index) => (
                  <tr key={variety.variety} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-medium text-gray-900 border-r text-xs sm:text-sm">
                      <div className="truncate max-w-[120px] sm:max-w-none" title={variety.variety}>
                        {variety.variety}
                      </div>
                    </td>
                                        {allBagSizes.map(size => (
                      <td
                        key={size}
                        className={`px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-center text-gray-700 border-r text-xs sm:text-sm ${
                          getQuantityForSize(variety, size) > 0
                            ? 'cursor-pointer hover:bg-blue-50 transition-colors relative group'
                            : ''
                        }`}
                        onClick={() => handleCellClick(variety, size)}
                        title={getQuantityForSize(variety, size) > 0 ? `Click to view ${variety.variety} - ${size} breakdown` : ''}
                      >
                        {getQuantityForSize(variety, size)}
                        {getQuantityForSize(variety, size) > 0 && (
                          <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                        )}
                      </td>
                    ))}
                    <td
                      className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center font-bold text-blue-600 bg-blue-50 text-xs sm:text-sm ${
                        calculateVarietyTotal(variety, allBagSizes) > 0
                          ? 'cursor-pointer hover:bg-blue-100 transition-colors relative group'
                          : ''
                      }`}
                      onClick={() => {
                        const total = calculateVarietyTotal(variety, allBagSizes);
                        if (total > 0) {
                          navigate('/erp/variety-breakdown', {
                            state: { variety: variety.variety, bagSize: 'All Sizes' }
                          });
                        }
                      }}
                      title={calculateVarietyTotal(variety, allBagSizes) > 0 ? `Click to view all sizes for ${variety.variety}` : ''}
                    >
                      {calculateVarietyTotal(variety, allBagSizes)}
                      {calculateVarietyTotal(variety, allBagSizes) > 0 && (
                        <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                      )}
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-gray-100 font-bold">
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-900 border-r text-xs sm:text-sm">
                    Bag Total
                  </td>
                  {allBagSizes.map(size => (
                    <td key={size} className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-center text-gray-900 border-r text-xs sm:text-sm">
                      {getTotalForSize(size)}
                    </td>
                  ))}
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-blue-600 bg-blue-100 text-xs sm:text-sm">
                    {totalBags}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockSummaryTable;