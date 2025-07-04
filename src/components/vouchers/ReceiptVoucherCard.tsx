import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { Order, StoreAdmin, OrderDetails, BagSize } from '@/utils/types';
import { ChevronDown, ChevronUp, Pencil, Share2 } from 'lucide-react';
import { useState } from 'react';
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
    const message: WebViewMessage = {
      type: 'SHARE_CARD',
      title: "Receipt Voucher " + order.voucher.voucherNumber,
      message: order.farmerId.name,
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
          <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md w-fit">
            C.Stock: <span className="font-medium text-gray-900">{order.currentStockAtThatTime}</span>
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
                <p className="text-sm font-medium text-gray-900">{calculateLotNo(order.orderDetails)}</p>
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
            {/* Stock Details */}
            {order.orderDetails.map((detail, index) => (
              <div key={index} className="space-y-4">
                {/* Mobile View - Stacked Layout */}
                <div className="block sm:hidden space-y-3">
                  {detail.bagSizes.map((bagSize, idx) => {
                    const current = bagSize.quantity?.currentQuantity || 0;
                    const initial = bagSize.quantity?.initialQuantity || 0;
                    const bagName = bagSize.size;

                    return (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">{bagName}</span>
                          <span className="text-sm font-medium text-gray-900">{initial}/{current}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Total Row for Mobile */}
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900">Total</span>
                      <span className="text-sm font-semibold text-primary">
                        {detail.bagSizes.reduce((sum, bag) => sum + (bag.quantity?.initialQuantity || 0), 0)}/
                        {detail.bagSizes.reduce((sum, bag) => sum + (bag.quantity?.currentQuantity || 0), 0)}
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
                            {detail.bagSizes.map((bagSize, idx) => (
                              <th key={idx} className="text-center py-3 px-3 font-medium text-gray-900 border-b border-gray-200" style={{ width: `${100 / (detail.bagSizes.length + 1)}%` }}>
                                {formatBagSizeName(bagSize.size)}
                              </th>
                            ))}
                            <th className="text-center py-3 px-3 font-medium text-gray-900 border-b border-gray-200" style={{ width: `${100 / (detail.bagSizes.length + 1)}%` }}>
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100">
                            {detail.bagSizes.map((bagSize, idx) => (
                              <td key={idx} className="py-3 px-3 text-center">
                                {(() => {
                                  const qty = bagSize.quantity;
                                  return qty && qty.initialQuantity ? (
                                    <span className="font-medium text-gray-900">
                                      {qty.initialQuantity}/{qty.currentQuantity || 0}
                                    </span>
                                  ) : '-';
                                })()}
                              </td>
                            ))}
                            {/* Total */}
                            <td className="py-3 px-3 text-center">
                              <span className="font-semibold text-primary">
                                {detail.bagSizes.reduce((sum, bag) => sum + (bag.quantity?.initialQuantity || 0), 0)}/
                                {detail.bagSizes.reduce((sum, bag) => sum + (bag.quantity?.currentQuantity || 0), 0)}
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