import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { StoreAdmin } from '@/utils/types';
import { formatNumber } from '@/lib/utils';
import { pdf } from '@react-pdf/renderer';
import StockSummaryPDF from '@/components/pdf/StockSummaryPDF';
import { Printer } from 'lucide-react';

export interface StockSummary {
  variety: string;
  sizes: {
    size: string;
    initialQuantity: number;
    currentQuantity: number;
    quantityRemoved?: number;
  }[];
}

export type TabType = 'current' | 'initial' | 'outgoing';

export interface StockSummaryTableProps {
  stockSummary: StockSummary[];
  tabType?: TabType;
}

const calculateVarietyTotal = (variety: StockSummary, allBagSizes: string[], tabType: TabType = 'current') => {
  return allBagSizes.reduce((acc, sizeName) => {
    const sizeData = variety.sizes.find(s => s.size === sizeName);
    if (!sizeData) return acc;

    switch (tabType) {
      case 'current':
        return acc + sizeData.currentQuantity;
      case 'initial':
        return acc + sizeData.initialQuantity;
      case 'outgoing':
        return acc + (sizeData.quantityRemoved || 0);
      default:
        return acc + sizeData.currentQuantity;
    }
  }, 0);
};

const calculateTotalBags = (stockSummary: StockSummary[], allBagSizes: string[], tabType: TabType = 'current') => {
  return stockSummary.reduce((total, variety) => {
    return total + calculateVarietyTotal(variety, allBagSizes, tabType);
  }, 0);
};

const StockSummaryTable = ({ stockSummary, tabType = 'current' }: StockSummaryTableProps) => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo) as StoreAdmin | null;
  const navigate = useNavigate();

  // Handle print report
  const handlePrintReport = async () => {
    if (!adminInfo) {
      console.error('Admin info not available');
      return;
    }

    try {
      console.log('Starting PDF generation...');

      // Generate PDF as blob
      const pdfBlob = await pdf(<StockSummaryPDF stockSummary={stockSummary} adminInfo={adminInfo} />).toBlob();

      console.log('PDF blob generated, size:', pdfBlob.size, 'bytes');

      // Create a more reliable blob URL by ensuring proper MIME type
      const enhancedBlob = new Blob([pdfBlob], {
        type: "application/pdf",
      });

      const pdfUrl = URL.createObjectURL(enhancedBlob);
      console.log('PDF URL created:', pdfUrl);

      // Create filename with date for fallback download
      const fileName = `stock-summary-report-${new Date().toISOString().split('T')[0]}.pdf`;

      // Open PDF in new tab for viewing (not downloading)
      const newWindow = window.open(pdfUrl, "_blank");

      if (newWindow) {
        console.log('PDF opened in new tab successfully');

        // Clean up the URL object after a delay to ensure PDF loads
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
          console.log('PDF URL cleaned up');
        }, 5000);
      } else {
        // Popup blocked - fallback to download
        console.log('Popup blocked, creating download link...');
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfUrl;
        downloadLink.download = fileName;
        downloadLink.style.display = 'none';

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        alert('Popup was blocked. PDF has been downloaded instead.');

        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

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

  // Filter out bag sizes with no values based on tabType
  const allBagSizesWithValues = useMemo(() => {
    return allBagSizes.filter(size => {
      // Check if any variety has a non-zero value for this size
      return stockSummary.some(variety => {
        const sizeData = variety.sizes.find(s => s.size === size);
        if (!sizeData) return false;

        switch (tabType) {
          case 'current':
            return sizeData.currentQuantity > 0;
          case 'initial':
            return sizeData.initialQuantity > 0;
          case 'outgoing':
            return (sizeData.quantityRemoved || 0) > 0;
          default:
            return sizeData.currentQuantity > 0;
        }
      });
    });
  }, [allBagSizes, stockSummary, tabType]);

  // Helper function to get quantity for a specific bag size and variety
  const getQuantityForSize = (variety: StockSummary, sizeName: string) => {
    const sizeData = variety.sizes.find(s => s.size === sizeName);
    if (!sizeData) return 0;

    switch (tabType) {
      case 'current':
        return sizeData.currentQuantity;
      case 'initial':
        return sizeData.initialQuantity;
      case 'outgoing':
        return sizeData.quantityRemoved || 0;
      default:
        return sizeData.currentQuantity;
    }
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
        state: { variety: variety.variety, bagSize, initialTabType: tabType }
      });
    }
  };

  // Sort varieties alphabetically
  const sortedVarieties = useMemo(() => {
    return [...stockSummary].sort((a, b) => a.variety.localeCompare(b.variety));
  }, [stockSummary]);

  const totalBags = calculateTotalBags(stockSummary, allBagSizesWithValues, tabType);

  const getTabTitle = () => {
    switch (tabType) {
      case 'current':
        return 'Current Stock';
      case 'initial':
        return 'Initial Quantities';
      case 'outgoing':
        return 'Outgoing Quantities';
      default:
        return 'Stock Summary';
    }
  };

  const getTabDescription = () => {
    switch (tabType) {
      case 'current':
        return 'Current inventory quantities by variety and size. Click on any cell with quantity to view detailed breakdown.';
      case 'initial':
        return 'Initial quantities received by variety and size. Click on any cell with quantity to view detailed breakdown.';
      case 'outgoing':
        return 'Quantities removed/outgoing by variety and size. Click on any cell with quantity to view detailed breakdown.';
      default:
        return 'Distribution of potato varieties by size category. Click on any cell with quantity to view detailed breakdown.';
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="bg-gray-50 border-b px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">{getTabTitle()}</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              {getTabDescription()}
            </p>
          </div>
          <Button
            onClick={handlePrintReport}
            variant="outline"
            size="sm"
            className="ml-4 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
        </div>
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
                  {allBagSizesWithValues.map(size => (
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
                                        {allBagSizesWithValues.map(size => (
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
                        {getQuantityForSize(variety, size) > 0 ? formatNumber(getQuantityForSize(variety, size)) : '-'}
                        {getQuantityForSize(variety, size) > 0 && (
                          <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                        )}
                      </td>
                    ))}
                    <td
                      className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center font-bold text-blue-600 bg-blue-50 text-xs sm:text-sm ${
                        calculateVarietyTotal(variety, allBagSizesWithValues, tabType) > 0
                          ? 'cursor-pointer hover:bg-blue-100 transition-colors relative group'
                          : ''
                      }`}
                      onClick={() => {
                        const total = calculateVarietyTotal(variety, allBagSizesWithValues, tabType);
                        if (total > 0) {
                          navigate('/erp/variety-breakdown', {
                            state: { variety: variety.variety, bagSize: 'All Sizes', initialTabType: tabType }
                          });
                        }
                      }}
                      title={calculateVarietyTotal(variety, allBagSizesWithValues, tabType) > 0 ? `Click to view all sizes for ${variety.variety}` : ''}
                    >
                      {calculateVarietyTotal(variety, allBagSizesWithValues, tabType) > 0 ? formatNumber(calculateVarietyTotal(variety, allBagSizesWithValues, tabType)) : '-'}
                      {calculateVarietyTotal(variety, allBagSizesWithValues, tabType) > 0 && (
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
                  {allBagSizesWithValues.map(size => (
                    <td key={size} className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-center text-gray-900 border-r text-xs sm:text-sm">
                      {getTotalForSize(size) > 0 ? formatNumber(getTotalForSize(size)) : '-'}
                    </td>
                  ))}
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-blue-600 bg-blue-100 text-xs sm:text-sm">
                    {totalBags > 0 ? formatNumber(totalBags) : '-'}
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