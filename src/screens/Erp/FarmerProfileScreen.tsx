import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import { accountingApi } from '@/lib/api/accounting';
import TopBar from '@/components/common/Topbar/Topbar';
import { Phone, MapPin, Package, ArrowDownCircle, ArrowUpCircle, FileText, AlertCircle, IndianRupee, Pencil, Wallet, Percent, Receipt, BookOpen, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import DeliveryVoucherCard from '@/components/vouchers/DeliveryVoucherCard';
import ReceiptVoucherCard from '@/components/vouchers/ReceiptVoucherCard';
import { Order, StoreAdmin } from '@/utils/types';
import { pdf, PDFDownloadLink } from '@react-pdf/renderer';
// import FarmerReportPDF from '@/components/pdf/FarmerReportPDF';
import KangReportPdf from '@/components/pdf/kang/KangReportPDF';
import Loader from '@/components/common/Loader/Loader';
import EditFarmerModal from '@/components/modals/EditFarmerModal';
import { useQueryClient } from '@tanstack/react-query';
import BuyPotatoForm from '@/components/finances/BuyPotatoForm';
import SellPotatoForm from '@/components/finances/SellPotatoForm';
import ReceivePaymentForm from '@/components/finances/ReceivePaymentForm';
import AddPaymentForm from '@/components/finances/AddPaymentForm';
import AddDiscountForm from '@/components/finances/AddDiscountForm';
import AddChargeForm from '@/components/finances/AddChargeForm';
import { SimpleDatePicker } from '@/components/ui/simple-date-picker';

// Add WebView interfaces
interface WebViewPDFMessage {
  type: 'OPEN_PDF_NATIVE';
  title: string;
  fileName: string;
  pdfData: string; // base64 encoded PDF
}

interface ReactNativeWebViewType {
  postMessage(message: string): void;
}

declare global {
  interface Window {
    ReactNativeWebView?: ReactNativeWebViewType;
  }
}

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  farmerId: string;
  createdAt: string;
  imageUrl?: string;
  costPerBag?: number;
}

interface StockSummary {
  variety: string;
  sizes: {
    size: string;
    initialQuantity: number;
    currentQuantity: number;
    quantityRemoved?: number;
  }[];
}

interface StockSummaryResponse {
  status: string;
  stockSummary: StockSummary[];
}

// Add new type definitions for filters
type OrderType = 'all' | 'incoming' | 'outgoing';
type SortOrder = 'latest' | 'oldest';
type TabType = 'current' | 'initial' | 'outgoing';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

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

const calculateFarmerTotalBags = (stockSummary: StockSummary[], allBagSizes: string[], tabType: TabType = 'current') => {
  return stockSummary.reduce((total, variety) => {
    return total + calculateVarietyTotal(variety, allBagSizes, tabType);
  }, 0);
};

const FarmerProfileScreen = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [farmer, setFarmer] = useState<Farmer | null>(location.state?.farmer as Farmer | null);
  console.log(farmer)
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo) as StoreAdmin | null;
  const [showOrders, setShowOrders] = useState(true); // Set to true by default
  const [showPDFDownload, setShowPDFDownload] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // Loading state for PDF generation
  const [pdfGenerationError, setPdfGenerationError] = useState<string | null>(null);
  const [pdfGenerationProgress, setPdfGenerationProgress] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFinancesDialogOpen, setIsFinancesDialogOpen] = useState(false);
  const [isBuyPotatoDialogOpen, setIsBuyPotatoDialogOpen] = useState(false);
  const [isSellPotatoDialogOpen, setIsSellPotatoDialogOpen] = useState(false);
  const [isReceivePaymentDialogOpen, setIsReceivePaymentDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isAddDiscountDialogOpen, setIsAddDiscountDialogOpen] = useState(false);
  const [isAddChargeDialogOpen, setIsAddChargeDialogOpen] = useState(false);

  // Add new state for filters
  const [orderType, setOrderType] = useState<OrderType>('all');
  const [sortBy, setSortBy] = useState<SortOrder>('latest');
  const [activeTab, setActiveTab] = useState<TabType>('current');

  // Date range filter state
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [appliedDateRange, setAppliedDateRange] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });

  // Update farmer state when location.state changes
  useEffect(() => {
    if (location.state?.farmer) {
      setFarmer(location.state.farmer as Farmer);
    }
  }, [location.state]);

  // Memoized PDF component to prevent unnecessary re-renders
  const MemoizedFarmerReportPDF = memo(KangReportPdf);

  const { data: stockData, isLoading: isStockLoading } = useQuery({
    queryKey: ['farmerStock', id, adminInfo?.token, appliedDateRange.from, appliedDateRange.to],
    queryFn: () => {
      const params: { from?: string; to?: string } = {};
      if (appliedDateRange.from) {
        params.from = appliedDateRange.from;
      }
      if (appliedDateRange.to) {
        params.to = appliedDateRange.to;
      }
      return storeAdminApi.getFarmerStockSummary(id || '', params, adminInfo?.token || '');
    },
    enabled: !!id && !!adminInfo?.token,
  });

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['farmerOrders', id, adminInfo?.token, orderType, sortBy, appliedDateRange.from, appliedDateRange.to],
    queryFn: () => {
      const params: { from?: string; to?: string } = {};
      if (appliedDateRange.from) {
        params.from = appliedDateRange.from;
      }
      if (appliedDateRange.to) {
        params.to = appliedDateRange.to;
      }
      return storeAdminApi.getFarmerOrders(id || '', params, adminInfo?.token || '');
    },
    enabled: !!id && !!adminInfo?.token,
  });

  const { data: ledgersData } = useQuery({
    queryKey: ['ledgers', adminInfo?.token],
    queryFn: () => accountingApi.getLedgers({}, adminInfo?.token || ''),
    enabled: !!adminInfo?.token,
  });

  // Format date for API
  const formatDateForAPI = (date: Date | undefined): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    const from = formatDateForAPI(fromDate);
    const to = formatDateForAPI(toDate);

    // If to date is provided, set time to end of day (23:59:59)
    let toWithTime = null;
    if (to && toDate) {
      toWithTime = `${to}T23:59:59Z`;
    }

    // If from date is provided, set time to start of day (00:00:00)
    let fromWithTime = null;
    if (from && fromDate) {
      fromWithTime = `${from}T00:00:00Z`;
    }

    setAppliedDateRange({
      from: fromWithTime,
      to: toWithTime,
    });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setAppliedDateRange({ from: null, to: null });
  };

  // Filter orders based on type
  const filteredOrders = useMemo(() => {
    if (!ordersData?.data) return [];

    let orders = [...ordersData.data];

    // Filter by type
    if (orderType === 'incoming') {
      orders = orders.filter(order => order.voucher.type === 'RECEIPT');
    } else if (orderType === 'outgoing') {
      orders = orders.filter(order => order.voucher.type === 'DELIVERY');
    }

    // Sort orders
    orders.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return orders;
  }, [ordersData?.data, orderType, sortBy]);

  const stockSummary = useMemo(() => {
    return (stockData as StockSummaryResponse)?.stockSummary || [];
  }, [stockData]);

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
  const getQuantityForSize = (variety: StockSummary, sizeName: string, tabType: TabType = 'current') => {
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
  const getTotalForSize = (sizeName: string, tabType: TabType = 'current') => {
    return sortedStockSummary.reduce((total, variety) => {
      return total + getQuantityForSize(variety, sizeName, tabType);
    }, 0);
  };

  const totalBags = calculateFarmerTotalBags(sortedStockSummary, allBagSizes, activeTab);

  // Calculate totals for each tab
  const currentTotal = calculateFarmerTotalBags(sortedStockSummary, allBagSizes, 'current');
  const initialTotal = calculateFarmerTotalBags(sortedStockSummary, allBagSizes, 'initial');
  const outgoingTotal = calculateFarmerTotalBags(sortedStockSummary, allBagSizes, 'outgoing');

  // Calculate total rent (initial bags * cost per bag)
  const totalRent = useMemo(() => {
    if (!farmer?.costPerBag || initialTotal === 0) return 0;
    return initialTotal * farmer.costPerBag;
  }, [initialTotal, farmer?.costPerBag]);

  const handleGenerateReport = useCallback(async () => {
    // WebView detection function
    const isWebView = () => {
      return window.ReactNativeWebView !== undefined;
    };

    // Reset error state
    setPdfGenerationError(null);
    setPdfGenerationProgress(0);

    if (!adminInfo || !farmer) {
      setPdfGenerationError('Please ensure farmer and admin data is available');
      return;
    }

    if (!ordersData?.data) {
      setPdfGenerationError('Orders data is still loading. Please try again in a moment.');
      return;
    }

    // Set loading state
    setIsGeneratingPDF(true);
    setPdfGenerationProgress(10);

    try {
      console.log('Starting PDF generation...');

      // Update progress
      setPdfGenerationProgress(20);

      // Create memoized PDF component
      const pdfDoc = <MemoizedFarmerReportPDF
        farmer={farmer}
        adminInfo={adminInfo}
        orders={ordersData.data}
      />;

      console.log('PDF component created, generating blob...');
      setPdfGenerationProgress(40);

      // Generate PDF as blob with progress tracking
      const pdfBlob = await pdf(pdfDoc).toBlob();
      console.log('PDF blob generated, size:', pdfBlob.size, 'bytes');
      setPdfGenerationProgress(70);

      // Check if running in WebView
      if (isWebView()) {
        console.log('WebView detected, sending PDF to React Native...');
        setPdfGenerationProgress(80);

        // Convert blob to base64
        const reader = new FileReader();
        reader.onload = function() {
          const base64Data = (reader.result as string).split(',')[1]; // Remove data:application/pdf;base64, prefix

          const fileName = `${farmer.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;

          const message: WebViewPDFMessage = {
            type: 'OPEN_PDF_NATIVE',
            title: `${farmer.name} - Farmer Report`,
            fileName: fileName,
            pdfData: base64Data
          };

          window.ReactNativeWebView?.postMessage(JSON.stringify(message));
          console.log('PDF data sent to React Native');

          // Complete progress and reset loading state
          setPdfGenerationProgress(100);
          setTimeout(() => {
            setIsGeneratingPDF(false);
            setPdfGenerationProgress(0);
          }, 500);
        };

        reader.onerror = function() {
          console.error('Error converting PDF to base64');
          setPdfGenerationError('Error preparing PDF for native viewer. Please try again.');
          setIsGeneratingPDF(false);
          setPdfGenerationProgress(0);
        };

        reader.readAsDataURL(pdfBlob);
      } else {
        // Web browser handling
        console.log('Web browser detected, opening PDF in new tab...');
        setPdfGenerationProgress(85);

        // Create a more reliable blob URL by ensuring proper MIME type
        const enhancedBlob = new Blob([pdfBlob], {
          type: 'application/pdf'
        });

        const pdfUrl = URL.createObjectURL(enhancedBlob);
        console.log('PDF URL created:', pdfUrl);
        setPdfGenerationProgress(90);

        // Create filename with farmer name and date for fallback download
        const fileName = `${farmer.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;

        // Open PDF in new tab for viewing (not downloading)
        const newWindow = window.open(pdfUrl, '_blank');

        if (newWindow) {
          console.log('PDF opened in new tab successfully');
          setPdfGenerationProgress(100);

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

          setPdfGenerationError('Popup was blocked. PDF has been downloaded instead.');
          setPdfGenerationProgress(100);

          setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
        }

        // Complete progress and reset loading state
        setTimeout(() => {
          setIsGeneratingPDF(false);
          setPdfGenerationProgress(0);
        }, 1000);
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      setPdfGenerationError('Failed to generate PDF. Please try again.');

      // For WebView, show a simple error message
      if (isWebView()) {
        setIsGeneratingPDF(false);
        setPdfGenerationProgress(0);
      } else {
        // Fallback to PDFDownloadLink on error for web browsers
        console.log('Falling back to PDFDownloadLink method...');
        setShowPDFDownload(true);
        setIsGeneratingPDF(false);
        setPdfGenerationProgress(0);
      }
    }
  }, [adminInfo, farmer, ordersData?.data, MemoizedFarmerReportPDF]);

  const handleViewFinancialLedger = useCallback(() => {
    if (!farmer || !ledgersData?.data) return;

    // Find the farmer's ledger by matching the name
    const farmerLedger = ledgersData.data.find(
      (ledger: { name: string; _id: string }) =>
        ledger.name.toLowerCase() === farmer.name.toLowerCase()
    );

    if (!farmerLedger) {
      // If ledger not found, still navigate but show a message
      navigate('/erp/myfinances');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('switchTab', { detail: 'ledger-view' }));
      }, 100);
      return;
    }

    // Navigate to myfinances page
    navigate('/erp/myfinances');

    // Switch to ledger view tab and then open the ledger
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('switchTab', { detail: 'ledger-view' }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('viewLedger', { detail: farmerLedger._id }));
      }, 100);
    }, 100);
  }, [farmer, ledgersData?.data, navigate]);

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
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                    {farmer.name}
                  </h1>
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                    title="Edit farmer information"
                  >
                    <Pencil className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
                <p className="text-base sm:text-lg text-gray-600 mb-6 font-medium">
                  {t('farmerProfile.memberSince')} {new Date(farmer.createdAt).toLocaleDateString()}
                </p>

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6">
                  <Button
                    onClick={() => setIsFinancesDialogOpen(true)}
                    variant="outline"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
                  >
                    <Wallet className="mr-2 h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">Finances</span>
                    <span className="sm:hidden">Finances</span>
                  </Button>
                  <Button
                    onClick={handleViewFinancialLedger}
                    variant="outline"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
                  >
                    <BookOpen className="mr-2 h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">View Financial Ledger</span>
                    <span className="sm:hidden">Financial Ledger</span>
                  </Button>
                  <Button
                    onClick={handleGenerateReport}
                    variant="outline"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 px-4 sm:px-6 py-2.5 font-medium"
                    disabled={isOrdersLoading || isGeneratingPDF}
                  >
                    {isOrdersLoading ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        <span className="hidden sm:inline">{t('farmerProfile.loading')}</span>
                        <span className="sm:hidden">Loading</span>
                      </>
                    ) : isGeneratingPDF ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        <span className="hidden sm:inline">
                          Generating PDF... {pdfGenerationProgress > 0 && `${pdfGenerationProgress}%`}
                        </span>
                        <span className="sm:hidden">
                          Generating... {pdfGenerationProgress > 0 && `${pdfGenerationProgress}%`}
                        </span>
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4 text-primary" />
                        <span className="hidden sm:inline">View Stock Ledger</span>
                        <span className="sm:hidden">Stock Ledger</span>
                      </>
                    )}
                  </Button>
                  {showPDFDownload && ordersData?.data && (
                    <PDFDownloadLink
                      document={
                        <MemoizedFarmerReportPDF
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
                            <Loader size="sm" className="mr-2" />
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

                {/* Error Display */}
                {pdfGenerationError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700">{pdfGenerationError}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPdfGenerationError(null)}
                      className="ml-auto text-red-500 hover:text-red-700 p-1 h-auto"
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Cards Section */}
          <CardContent className="p-6 sm:p-8 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Account Number Card */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <svg className="w-[18px] h-[18px] text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M8 8h8M8 12h8M8 16h4" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Account Number
                    </div>
                    <div className="font-medium text-gray-900 truncate">{farmer.farmerId}</div>
                  </div>
                </div>
              </div>

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

            {/* Total Rent Card - shown below the main grid */}
            {farmer.costPerBag && (
              <div className="mt-4 sm:mt-6">
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IndianRupee size={18} className="text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Total Rent
                      </div>
                      <div className="font-bold text-2xl text-primary">
                        ₹{totalRent.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ({initialTotal} bags × ₹{farmer.costPerBag.toLocaleString('en-IN')} per bag)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date Range Filter Section */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                Filter by Date Range
              </CardTitle>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Filter stock summary and orders by selecting a date range
            </p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    From Date
                  </label>
                  <SimpleDatePicker
                    value={fromDate}
                    onChange={setFromDate}
                    placeholder="DD.MM.YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    To Date
                  </label>
                  <SimpleDatePicker
                    value={toDate}
                    onChange={setToDate}
                    placeholder="DD.MM.YYYY"
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleApplyFilters}
                  className="flex-1 sm:flex-none text-sm"
                  variant="default"
                  size="default"
                >
                  Apply Filters
                </Button>
                <Button
                  onClick={handleClearFilters}
                  className="flex-1 sm:flex-none text-sm"
                  variant="outline"
                  size="default"
                >
                  Clear
                </Button>
              </div>
            </div>
            {(appliedDateRange.from || appliedDateRange.to) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs sm:text-sm font-medium text-blue-900 mb-1">Active Filters:</div>
                <div className="text-xs text-blue-700 space-y-0.5">
                  {appliedDateRange.from && (
                    <div>From: {new Date(appliedDateRange.from).toLocaleDateString()}</div>
                  )}
                  {appliedDateRange.to && (
                    <div>To: {new Date(appliedDateRange.to).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Summary Section */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Stock Summary</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                  View stock quantities by current inventory, initial quantities, or outgoing quantities.
                </p>
              </div>
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
                  Current ({currentTotal})
                </button>
                <button
                  onClick={() => setActiveTab('initial')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'initial'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Initial ({initialTotal})
                </button>
                <button
                  onClick={() => setActiveTab('outgoing')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'outgoing'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Outgoing ({outgoingTotal})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-0">
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
                      {sortedStockSummary.map((variety, index) => (
                        <tr key={variety.variety} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-medium text-gray-900 border-r text-xs sm:text-sm">
                            <div className="truncate max-w-[120px] sm:max-w-none" title={variety.variety}>
                              {variety.variety}
                            </div>
                          </td>
                          {allBagSizes.map(size => (
                            <td key={size} className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-center text-gray-700 border-r text-xs sm:text-sm">
                              {getQuantityForSize(variety, size, activeTab)}
                            </td>
                          ))}
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center font-bold text-blue-600 bg-blue-50 text-xs sm:text-sm">
                            {calculateVarietyTotal(variety, allBagSizes, activeTab)}
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
                            {getTotalForSize(size, activeTab)}
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
            )}
            </div>
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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                      {t('farmerProfile.ordersHistory')}
                    </CardTitle>

                    {/* Filters Row */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <select
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value as OrderType)}
                        className="w-full sm:w-[150px] px-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all duration-200"
                      >
                        <option value="all">{t('daybook.allOrders')}</option>
                        <option value="incoming">{t('daybook.incoming')}</option>
                        <option value="outgoing">{t('daybook.outgoing')}</option>
                      </select>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOrder)}
                        className="w-full sm:w-[150px] px-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all duration-200"
                      >
                        <option value="latest">{t('daybook.latestFirst')}</option>
                        <option value="oldest">{t('daybook.oldestFirst')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 md:p-6">
                {isOrdersLoading ? (
                  <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 sm:h-28 md:h-32 w-full" />
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
                    {t('farmerProfile.noOrdersFound')}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {filteredOrders.map((order: Order) => (
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

      {/* Edit Farmer Modal */}
      <EditFarmerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        farmer={farmer}
        token={adminInfo?.token || ''}
        onSuccess={(updatedFarmer) => {
          // Update the local farmer state with the updated data
          setFarmer(updatedFarmer);

          // Refetch farmer data to update the UI
          queryClient.invalidateQueries({ queryKey: ['farmerStock', id, adminInfo?.token] });
          queryClient.invalidateQueries({ queryKey: ['farmerOrders', id, adminInfo?.token] });
          queryClient.invalidateQueries({ queryKey: ['farmers'] });
        }}
      />

      {/* Finances Dialog */}
      <Dialog open={isFinancesDialogOpen} onOpenChange={setIsFinancesDialogOpen}>
        <DialogContent className="max-w-2xl w-[calc(100%-2rem)] sm:w-full">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="text-lg sm:text-xl">Finances</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-2 sm:mt-4">
            {/* Buy Potato Card */}
            <Card
              className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-primary/50 active:scale-95"
              onClick={() => {
                setIsFinancesDialogOpen(false);
                setIsBuyPotatoDialogOpen(true);
              }}
            >
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-3">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                    <ArrowDownCircle className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xs sm:text-lg font-semibold text-gray-900 leading-tight">Buy Potato</h3>
                </div>
              </CardContent>
            </Card>

            {/* Sell Potato Card */}
            <Card
              className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-primary/50 active:scale-95"
              onClick={() => {
                setIsFinancesDialogOpen(false);
                setIsSellPotatoDialogOpen(true);
              }}
            >
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-3">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                    <ArrowUpCircle className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <h3 className="text-xs sm:text-lg font-semibold text-gray-900 leading-tight">Sell Potato</h3>
                </div>
              </CardContent>
            </Card>

            {/* Receive Payment Card */}
            <Card
              className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-primary/50 active:scale-95"
              onClick={() => {
                setIsFinancesDialogOpen(false);
                setIsReceivePaymentDialogOpen(true);
              }}
            >
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-3">
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                    <IndianRupee className="h-5 w-5 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xs sm:text-lg font-semibold text-gray-900 leading-tight">Receive Payment</h3>
                </div>
              </CardContent>
            </Card>

            {/* Add Payment Card */}
            <Card
              className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-primary/50 active:scale-95"
              onClick={() => {
                setIsFinancesDialogOpen(false);
                setIsAddPaymentDialogOpen(true);
              }}
            >
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-3">
                  <div className="p-2 sm:p-3 bg-orange-100 rounded-full">
                    <Wallet className="h-5 w-5 sm:h-8 sm:w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xs sm:text-lg font-semibold text-gray-900 leading-tight">Add Payment</h3>
                </div>
              </CardContent>
            </Card>

            {/* Add Discount Card */}
            <Card
              className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-primary/50 active:scale-95"
              onClick={() => {
                setIsFinancesDialogOpen(false);
                setIsAddDiscountDialogOpen(true);
              }}
            >
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-3">
                  <div className="p-2 sm:p-3 bg-teal-100 rounded-full">
                    <Percent className="h-5 w-5 sm:h-8 sm:w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xs sm:text-lg font-semibold text-gray-900 leading-tight">Add Discount</h3>
                </div>
              </CardContent>
            </Card>

            {/* Add Charge Card */}
            <Card
              className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-primary/50 active:scale-95"
              onClick={() => {
                setIsFinancesDialogOpen(false);
                setIsAddChargeDialogOpen(true);
              }}
            >
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-3">
                  <div className="p-2 sm:p-3 bg-indigo-100 rounded-full">
                    <Receipt className="h-5 w-5 sm:h-8 sm:w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xs sm:text-lg font-semibold text-gray-900 leading-tight">Add Charge</h3>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Buy Potato Dialog */}
      <BuyPotatoForm
        isOpen={isBuyPotatoDialogOpen}
        onClose={() => setIsBuyPotatoDialogOpen(false)}
        farmer={farmer}
      />

      {/* Sell Potato Dialog */}
      <SellPotatoForm
        isOpen={isSellPotatoDialogOpen}
        onClose={() => setIsSellPotatoDialogOpen(false)}
        farmer={farmer}
      />

      {/* Receive Payment Dialog */}
      <ReceivePaymentForm
        isOpen={isReceivePaymentDialogOpen}
        onClose={() => setIsReceivePaymentDialogOpen(false)}
        farmer={farmer}
      />

      {/* Add Payment Dialog */}
      <AddPaymentForm
        isOpen={isAddPaymentDialogOpen}
        onClose={() => setIsAddPaymentDialogOpen(false)}
        farmer={farmer}
      />

      {/* Add Discount Dialog */}
      <AddDiscountForm
        isOpen={isAddDiscountDialogOpen}
        onClose={() => setIsAddDiscountDialogOpen(false)}
        farmer={farmer}
      />

      {/* Add Charge Dialog */}
      <AddChargeForm
        isOpen={isAddChargeDialogOpen}
        onClose={() => setIsAddChargeDialogOpen(false)}
        farmer={farmer}
      />
    </>
  );
};

export default FarmerProfileScreen;
