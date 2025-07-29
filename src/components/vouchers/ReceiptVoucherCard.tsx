import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { Order, StoreAdmin, OrderDetails, BagSize } from '@/utils/types';
import { ChevronDown, ChevronUp, Pencil, Share2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Printer } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import OrderVoucherPDF from '../pdf/OrderVoucherPDF';
import * as ReactDOM from 'react-dom/client';
import { toast } from 'react-hot-toast';

interface WebViewMessage {
  type: 'SHARE_CARD';
  title: string;
  message: string;
}

interface ReactNativeWebViewType {
  postMessage(message: string): void;
}

declare global {
  interface Window {
    ReactNativeWebView?: ReactNativeWebViewType;
  }
}

interface ReceiptVoucherCardProps {
  order: Order;
}

const ReceiptVoucherCard = ({ order }: ReceiptVoucherCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo) as StoreAdmin | null;
  const navigate = useNavigate();

  // Sort bag sizes according to admin preferences using useMemo
  const sortBagSizes = useMemo(() => {
    if (!adminInfo?.preferences?.bagSizes) {
      return (bagSizes: BagSize[]) => bagSizes;
    }

    // Create a map of normalized bag size names to their index in admin preferences
    const preferenceOrder = new Map(
      adminInfo.preferences.bagSizes.map((size, index) => [
        size.toLowerCase().replace(/[-\s]/g, ''), // Normalize by removing hyphens and spaces
        index
      ])
    );

    // Return a sorting function
    return (bagSizes: BagSize[]) => {
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

  // Pre-sort all bag sizes for each order detail
  const sortedOrderDetails = useMemo(() => {
    return order.orderDetails.map(detail => ({
      ...detail,
      sortedBagSizes: sortBagSizes(detail.bagSizes)
    }));
  }, [order.orderDetails, sortBagSizes]);

  // Calculate total initial quantity for Lot No
  const calculateLotNo = (orderDetails: OrderDetails[]) => {
    return orderDetails[0]?.bagSizes.reduce((sum: number, bagSize: BagSize) =>
      sum + (bagSize.quantity?.initialQuantity || 0), 0
    );
  };

  // Add a helper function to format bag size name for display
  const formatBagSizeName = (size: string): string => {
    return size;  // Return the size name exactly as it is
  };

  const isWebView = () => {
    return window.ReactNativeWebView !== undefined;
  };

  const shareCard = (order: Order) => {
    // Create a formatted message string with order details
    const orderSummary = `Receipt Voucher: ${order.voucher.voucherNumber}
Date: ${order.dateOfSubmission}
Party: ${order.farmerId.name} (${order.farmerId.farmerId})
Variety: ${order.orderDetails[0]?.variety || 'N/A'}
Lot No: ${calculateLotNo(order.orderDetails)}
Current Stock: ${order.currentStockAtThatTime}
${order.remarks ? `Remarks: ${order.remarks}` : ''}

Stock Details:
${order.orderDetails.map(detail =>
  detail.bagSizes.map(bag =>
    `${bag.size}: ${bag.quantity?.currentQuantity || 0}/${bag.quantity?.initialQuantity || 0}`
  ).join('\n')
).join('\n')}`;

    const message: WebViewMessage = {
      type: 'SHARE_CARD',
      title: "Receipt Voucher " + order.voucher.voucherNumber,
      message: orderSummary,
    };

    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  };

  const handleEdit = () => {
    // Check if any bag size has different initial and current quantities
    const hasOutgoingOrders = order.orderDetails.some(detail =>
      detail.bagSizes.some(bagSize =>
        (bagSize.quantity?.initialQuantity || 0) !== (bagSize.quantity?.currentQuantity || 0)
      )
    );

    if (hasOutgoingOrders) {
      toast.error('Edit is not allowed for this receipt as outgoing has been done from it');
      return;
    }

    navigate('/erp/incoming-order/edit', { state: { order } });
  };

  const handlePrint = () => {
    if (isWebView()) {
      // Handle printing in React Native WebView
      const printData = {
        type: 'PRINT_RECEIPT',
        voucherType: 'RECEIPT',
        voucherNumber: order.voucher.voucherNumber,
        date: order.dateOfSubmission,
        variety: order.orderDetails[0]?.variety || '',
        farmerName: order.farmerId.name,
        farmerId: order.farmerId.farmerId,
        farmerAddress: order.farmerId.address,
        farmerMobileNumber: order.farmerId.mobileNumber,
        currentStock: order.currentStockAtThatTime,
        remarks: order.remarks || '',
        orderDetails: order.orderDetails.map(detail => ({
          variety: detail.variety,
          location: detail.location,
          bagSizes: detail.bagSizes.map(bag => ({
            size: bag.size,
            initialQuantity: bag.quantity?.initialQuantity || 0,
            currentQuantity: bag.quantity?.currentQuantity || 0,
            utilization: bag.quantity?.initialQuantity ?
              Math.round(((bag.quantity.initialQuantity - (bag.quantity.currentQuantity || 0)) / bag.quantity.initialQuantity) * 100) : 0
          }))
        })),
        summary: {
          totalBagTypes: order.orderDetails.reduce((total, detail) => total + detail.bagSizes.length, 0),
          totalCurrentQuantity: order.orderDetails.reduce((total, detail) =>
            total + detail.bagSizes.reduce((sum, bag) => sum + (bag.quantity?.currentQuantity || 0), 0), 0
          ),
          totalInitialQuantity: order.orderDetails.reduce((total, detail) =>
            total + detail.bagSizes.reduce((sum, bag) => sum + (bag.quantity?.initialQuantity || 0), 0), 0
          ),
          averageUtilization: order.orderDetails.length > 0 ? Math.round(
            order.orderDetails.reduce((total, detail) =>
              total + detail.bagSizes.reduce((sum, bag) => {
                const initial = bag.quantity?.initialQuantity || 0;
                const current = bag.quantity?.currentQuantity || 0;
                return sum + (initial > 0 ? ((initial - current) / initial * 100) : 0);
              }, 0) / detail.bagSizes.length, 0
            ) / order.orderDetails.length
          ) : 0
        }
      };

      window.ReactNativeWebView?.postMessage(JSON.stringify(printData));
    } else {
      // Handle printing in web browser (existing PDF functionality)
      const printWindow = window.open('', '_blank');
      if (printWindow && adminInfo) {
        printWindow.document.write(`
          <html>
            <body>
              <div id="root" style="height: 100vh;"></div>
              <script>
                // Prevent the window from closing when React mounts
                window.onbeforeunload = null;
              </script>
            </body>
          </html>
        `);

        // Render PDF viewer in the new window
        const root = printWindow.document.getElementById('root');
        if (root) {
          ReactDOM.createRoot(root).render(
            <PDFViewer width="100%" height="100%">
              <OrderVoucherPDF order={order} adminInfo={adminInfo} />
            </PDFViewer>
          );
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 hover:border-primary/10 hover:shadow-md">
      {/* Header Section */}
      <div className="p-3 sm:p-4 lg:p-5">
        {/* Top Row - Voucher Number and Stock */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
            <span className="text-sm font-medium text-gray-900">
              Receipt Voucher: <span className="text-primary">{order.voucher.voucherNumber}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
              Date: <span className="font-medium text-gray-900">{order.dateOfSubmission || 'N/A'}</span>
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
              C.Stock: <span className="font-medium text-gray-900">{order.currentStockAtThatTime}</span>
            </div>
          </div>
        </div>

        {/* Main Content and Actions */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Section - Details */}
          <div className="flex-1">
            {/* Mobile: Single column layout, Desktop: 2 columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-3">
              <div className="min-w-0">
                <span className="text-xs text-gray-500 block">Variety</span>
                <p className="text-sm font-medium text-gray-900 truncate">{order.orderDetails[0]?.variety}</p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-gray-500 block">Lot No</span>
                <p className="text-sm font-medium text-gray-900">{order.voucher.voucherNumber}/{order.orderDetails[0]?.bagSizes.reduce((sum, bag) => sum + (bag.quantity?.initialQuantity || 0), 0)}</p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-gray-500 block">Party Name</span>
                <p className="text-sm font-medium text-gray-900 truncate">{order.farmerId.name}</p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-gray-500 block">Acc No</span>
                <p className="text-sm font-medium text-gray-900">{order.farmerId.farmerId}</p>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:order-1 lg:order-2">
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 flex-shrink-0"
              >
                <Pencil size={14} />
                <span className="hidden xs:inline">Edit</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 flex-shrink-0"
              >
                <Printer size={14} />
                <span className="hidden xs:inline">Print</span>
              </button>
              {isWebView() && (
                <button
                  onClick={() => shareCard(order)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 flex-shrink-0"
                >
                  <Share2 size={14} />
                  <span className="hidden xs:inline">Share</span>
                </button>
              )}
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 sm:order-2 lg:order-1 w-full sm:w-auto justify-center sm:justify-start"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={14} />
                  <span>Less Details</span>
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  <span>More Details</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="p-3 sm:p-4 lg:p-5 space-y-6">
            {/* Farmer Details */}
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Farmer Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Address</span>
                  <p className="text-sm font-medium text-gray-900">{order.farmerId.address || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Mobile Number</span>
                  <p className="text-sm font-medium text-gray-900">{order.farmerId.mobileNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Stock Details */}
            {sortedOrderDetails.map((detail, index) => (
              <div key={index} className="space-y-4">
                {/* Mobile View - Stacked Layout */}
                <div className="block sm:hidden space-y-3">
                  {detail.sortedBagSizes.map((bagSize, idx) => {
                    const current = bagSize.quantity?.currentQuantity || 0;
                    const initial = bagSize.quantity?.initialQuantity || 0;
                    const bagName = bagSize.size;

                    return (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">{bagName}</span>
                          <span className="text-sm font-medium text-gray-900">{current}/{initial}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Total Row for Mobile */}
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900">Total</span>
                      <span className="text-sm font-semibold text-primary">
                        {detail.sortedBagSizes.reduce((sum, bag) => sum + (bag.quantity?.currentQuantity || 0), 0)}/
                        {detail.sortedBagSizes.reduce((sum, bag) => sum + (bag.quantity?.initialQuantity || 0), 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desktop View - Table Layout */}
                <div className="hidden sm:block">
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            {detail.sortedBagSizes.map((bagSize, idx) => (
                              <th key={idx} className="text-center py-3 px-3 font-medium text-gray-900 border-b border-gray-200" style={{ width: `${100 / (detail.sortedBagSizes.length + 1)}%` }}>
                                {formatBagSizeName(bagSize.size)}
                              </th>
                            ))}
                            <th className="text-center py-3 px-3 font-medium text-gray-900 border-b border-gray-200" style={{ width: `${100 / (detail.sortedBagSizes.length + 1)}%` }}>
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100">
                            {detail.sortedBagSizes.map((bagSize, idx) => (
                              <td key={idx} className="py-3 px-3 text-center">
                                {(() => {
                                  const qty = bagSize.quantity;
                                  return qty && qty.initialQuantity ? (
                                    <span className="font-medium text-gray-900">
                                      {qty.currentQuantity || 0}/{qty.initialQuantity}
                                    </span>
                                  ) : '-';
                                })()}
                              </td>
                            ))}
                            {/* Total */}
                            <td className="py-3 px-3 text-center">
                              <span className="font-semibold text-primary">
                                {detail.sortedBagSizes.reduce((sum, bag) => sum + (bag.quantity?.currentQuantity || 0), 0)}/
                                {detail.sortedBagSizes.reduce((sum, bag) => sum + (bag.quantity?.initialQuantity || 0), 0)}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 rounded-lg p-3 gap-2">
                  <span className="text-sm text-gray-600 font-medium">Location:</span>
                  <span className="text-sm font-medium text-gray-900">{detail.location}</span>
                </div>
              </div>
            ))}

            {/* Remarks Section */}
            {order.remarks && (
              <div className="bg-yellow-50/50 rounded-xl p-4 border border-yellow-100">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Remarks</h3>
                <p className="text-sm text-gray-700 leading-relaxed break-words">{order.remarks}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptVoucherCard;