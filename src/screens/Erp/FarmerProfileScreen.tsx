import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import TopBar from '@/components/common/Topbar/Topbar';
import { Phone, MapPin, Calendar, Package, Boxes, ArrowDownCircle, ArrowUpCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import DeliveryVoucherCard from '@/components/vouchers/DeliveryVoucherCard';
import ReceiptVoucherCard from '@/components/vouchers/ReceiptVoucherCard';
import { Order, StoreAdmin } from '@/utils/types';
import { pdf, PDFDownloadLink } from '@react-pdf/renderer';
import FarmerReportPDF from '@/components/pdf/FarmerReportPDF';

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
  const { t } = useTranslation();
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const farmer = location.state?.farmer as Farmer;
  console.log(farmer)
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo) as StoreAdmin | null;
  const [showOrders, setShowOrders] = useState(false);
  const [showPDFDownload, setShowPDFDownload] = useState(false);

  const { data: stockData, isLoading: isStockLoading } = useQuery({
    queryKey: ['farmerStock', id, adminInfo?.token],
    queryFn: () => storeAdminApi.getFarmerStockSummary(id || '', adminInfo?.token || ''),
    enabled: !!id && !!adminInfo?.token,
  });

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['farmerOrders', id, adminInfo?.token],
    queryFn: () => storeAdminApi.getFarmerOrders(id || '', adminInfo?.token || ''),
    enabled: !!id && !!adminInfo?.token,
  });

  const stockSummary = (stockData as StockSummaryResponse)?.stockSummary || [];

  // Sort bag sizes according to admin preferences using useMemo
  const sortBagSizes = useMemo(() => {
    if (!adminInfo?.preferences?.bagSizes) {
      return (bagSizes: StockSummary['sizes']) => bagSizes;
    }

    // Create a map of normalized bag size names to their index in admin preferences
    const preferenceOrder = new Map(
      adminInfo.preferences.bagSizes.map((size, index) => [
        size.toLowerCase().replace(/[-\s]/g, ''), // Normalize by removing hyphens and spaces
        index
      ])
    );

    // Return a sorting function
    return (bagSizes: StockSummary['sizes']) => {
      if (!bagSizes.length) return bagSizes;

      return [...bagSizes].sort((a, b) => {
        // Normalize the bag size names for comparison
        const aNormalized = a.size.toLowerCase().replace(/[-\s]/g, '');
        const bNormalized = b.size.toLowerCase().replace(/[-\s]/g, '');

        const aIndex = preferenceOrder.get(aNormalized);
        const bIndex = preferenceOrder.get(bNormalized);

        // If both sizes are in preferences, sort by their order
        if (aIndex !== undefined && bIndex !== undefined) {
          return aIndex - bIndex;
        }

        // If only one size is in preferences, put it first
        if (aIndex !== undefined) return -1;
        if (bIndex !== undefined) return 1;

        // If neither size is in preferences, maintain original order
        return 0;
      });
    };
  }, [adminInfo?.preferences?.bagSizes]); // Only recompute when preferences change

  // Sort the stock summary data according to admin preferences
  const sortedStockSummary = useMemo(() => {
    return stockSummary.map(variety => ({
      ...variety,
      sizes: sortBagSizes(variety.sizes)
    }));
  }, [stockSummary, sortBagSizes]);

  const totalBags = calculateFarmerTotalBags(sortedStockSummary);

          const handleGenerateReport = async () => {
    if (!adminInfo || !farmer) {
      alert('Please ensure farmer and admin data is available');
      return;
    }

    if (!ordersData?.data) {
      alert('Orders data is still loading. Please try again in a moment.');
      return;
    }

    try {
      console.log('Starting PDF generation...');

      const pdfDoc = <FarmerReportPDF
        farmer={farmer}
        adminInfo={adminInfo}
        orders={ordersData.data}
      />;

      console.log('PDF component created, generating blob...');

      // Generate PDF as blob
      const pdfBlob = await pdf(pdfDoc).toBlob();
      console.log('PDF blob generated, size:', pdfBlob.size, 'bytes');

      // Create a more reliable blob URL by ensuring proper MIME type
      const enhancedBlob = new Blob([pdfBlob], {
        type: 'application/pdf'
      });

      const pdfUrl = URL.createObjectURL(enhancedBlob);
      console.log('PDF URL created:', pdfUrl);

      // Create filename with farmer name and date for fallback download
      const fileName = `${farmer.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;

      // Open PDF in new tab for viewing (not downloading)
      const newWindow = window.open(pdfUrl, '_blank');

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

      // Fallback to PDFDownloadLink on error
      console.log('Falling back to PDFDownloadLink method...');
      setShowPDFDownload(true);
      alert('PDF generation failed with the primary method. Please use the "Download Report" button that will appear.');
    }
  };

  if (!farmer) {
    return (
      <>
        <TopBar title={t('farmerProfile.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-red-500">{t('farmerProfile.notFound')}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={t('farmerProfile.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
        {/* Personal Information Card */}
        <Card className="overflow-hidden border border-gray-100 shadow-sm">
          {/* Header Background */}
          <div className="bg-gray-50/50 border-b border-gray-100 px-6 sm:px-8 pt-6 sm:pt-8 pb-0">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 border-4 border-white shadow-md">
                  <AvatarFallback className="text-xl sm:text-2xl lg:text-3xl bg-primary text-white font-bold">
                    {getInitials(farmer.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name and Basic Info */}
              <div className="flex-1 w-full text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                  {farmer.name}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mb-6 font-medium">
                  {t('farmerProfile.memberSince')} {new Date(farmer.createdAt).toLocaleDateString()}
                </p>

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => navigate(`/erp/incoming-order`, { state: { farmer } })}
                      className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
                    >
                      <ArrowDownCircle className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">{t('farmerProfile.incomingOrder')}</span>
                      <span className="sm:hidden">{t('daybook.incoming')}</span>
                    </Button>
                    <Button
                      onClick={() => navigate(`/erp/outgoing-order`, { state: { farmer } })}
                      variant="outline"
                      className="flex-1 sm:flex-initial bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
                    >
                      <ArrowUpCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="hidden sm:inline">{t('farmerProfile.outgoingOrder')}</span>
                      <span className="sm:hidden">{t('daybook.outgoing')}</span>
                    </Button>
                  </div>
                  <Button
                    onClick={handleGenerateReport}
                    variant="outline"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
                    disabled={isOrdersLoading}
                  >
                    {isOrdersLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        <span className="hidden sm:inline">{t('farmerProfile.loading')}</span>
                        <span className="sm:hidden">Loading</span>
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4 text-primary" />
                        <span className="hidden sm:inline">{t('farmerProfile.viewReport')}</span>
                        <span className="sm:hidden">{t('farmerProfile.report')}</span>
                      </>
                    )}
                  </Button>
                  {showPDFDownload && ordersData?.data && (
                    <PDFDownloadLink
                      document={
                        <FarmerReportPDF
                          farmer={farmer}
                          adminInfo={adminInfo!}
                          orders={ordersData.data}
                        />
                      }
                      fileName={`${farmer.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {({ loading }) => (
                        loading ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                            <span className="hidden sm:inline">{t('farmerProfile.generating')}</span>
                            <span className="sm:hidden">{t('farmerProfile.gen')}</span>
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-gray-500" />
                            <span className="hidden sm:inline">{t('farmerProfile.fallbackDownload')}</span>
                            <span className="sm:hidden">{t('farmerProfile.download')}</span>
                          </span>
                        )
                      )}
                    </PDFDownloadLink>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Information Cards Section */}
          <CardContent className="p-6 sm:p-8 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Phone Number Card */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {t('farmerProfile.phoneNumber')}
                    </div>
                    <div className="font-medium text-gray-900 truncate">{farmer.mobileNumber}</div>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {t('farmerProfile.address')}
                    </div>
                    <div className="font-medium text-gray-900 line-clamp-2 text-sm leading-relaxed">
                      {farmer.address}
                    </div>
                  </div>
                </div>
              </div>

              {/* Member Since Card */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {t('farmerProfile.memberSince')}
                    </div>
                    <div className="font-medium text-gray-900">
                      {new Date(farmer.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Bags Card */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {t('farmerProfile.totalBags')}
                    </div>
                    <div className="font-bold text-2xl text-primary">{totalBags}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Summary Section */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-primary" />
              <CardTitle className="text-base sm:text-lg md:text-xl">{t('farmerProfile.stockSummary')}</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <Boxes size={14} className="hidden sm:block" />
              <span>{t('farmerProfile.totalVarieties')}: {sortedStockSummary.length}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isStockLoading ? (
              <div className="p-4 sm:p-6 space-y-4">
                <Skeleton className="h-20 sm:h-24 w-full" />
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
            ) : sortedStockSummary.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
                {t('farmerProfile.noStockFound')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 border-r whitespace-nowrap">
                          Varieties
                        </th>
                        {sortedStockSummary.length > 0 && sortedStockSummary[0].sizes.map(size => (
                          <th key={size.size} className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900 border-r whitespace-nowrap">
                            {size.size}
                          </th>
                        ))}
                        <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900 bg-blue-50 whitespace-nowrap">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedStockSummary.map((variety, index) => (
                        <tr key={variety.variety} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-medium text-gray-900 border-r text-xs sm:text-sm">
                            <div className="truncate max-w-[120px] sm:max-w-none" title={variety.variety}>
                              {variety.variety}
                            </div>
                          </td>
                          {variety.sizes.map(size => (
                            <td key={size.size} className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-center text-gray-700 border-r text-xs sm:text-sm">
                              {size.currentQuantity}
                            </td>
                          ))}
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center font-bold text-blue-600 bg-blue-50 text-xs sm:text-sm">
                            {calculateVarietyTotal(variety.sizes)}
                          </td>
                        </tr>
                      ))}
                      {/* Totals Row */}
                      <tr className="bg-gray-100 font-bold">
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-900 border-r text-xs sm:text-sm">
                          Bag Total
                        </td>
                        {sortedStockSummary.length > 0 && sortedStockSummary[0].sizes.map(size => {
                          const sizeTotal = sortedStockSummary.reduce((total, variety) => {
                            const sizeData = variety.sizes.find(s => s.size === size.size);
                            return total + (sizeData ? sizeData.currentQuantity : 0);
                          }, 0);
                          return (
                            <td key={size.size} className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-center text-gray-900 border-r text-xs sm:text-sm">
                              {sizeTotal}
                            </td>
                          );
                        })}
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-blue-600 bg-blue-100 text-xs sm:text-sm">
                          {totalBags}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Show/Hide Orders Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setShowOrders(!showOrders)}
            className={`w-full sm:w-auto px-4 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all ${
              showOrders
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            {showOrders ? t('farmerProfile.hideOrdersHistory') : t('farmerProfile.showOrdersHistory')}
          </Button>
        </div>

        {/* Orders Section */}
        {showOrders && (
          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                  {t('farmerProfile.ordersHistory')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 md:p-6">
                {isOrdersLoading ? (
                  <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 sm:h-28 md:h-32 w-full" />
                    ))}
                  </div>
                ) : ordersData?.data?.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
                    {t('farmerProfile.noOrdersFound')}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {ordersData?.data?.map((order: Order) => (
                      order.voucher.type === 'DELIVERY' ? (
                        <DeliveryVoucherCard key={order._id} order={order} />
                      ) : (
                        <ReceiptVoucherCard key={order._id} order={order} />
                      )
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default FarmerProfileScreen;
