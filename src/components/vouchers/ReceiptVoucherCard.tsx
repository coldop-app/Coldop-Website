import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { Order, StoreAdmin } from '@/utils/types';
import { ChevronDown, ChevronUp, Pencil, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Printer } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import OrderVoucherPDF from '../pdf/OrderVoucherPDF';
import * as ReactDOM from 'react-dom/client';
import { toast } from 'react-hot-toast';

interface ReceiptVoucherCardProps {
  order: Order;
}

declare global {
  interface Window {
    ReactNativeWebView?: any;
  }
}

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  try {
    const [day, month, year] = dateStr.split('.');
    return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const ReceiptVoucherCard = ({ order }: ReceiptVoucherCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo) as StoreAdmin | null;
  const navigate = useNavigate();
  const bagSizes = adminInfo?.preferences?.bagSizes || [];

  const isWebView = () => {
    return window.ReactNativeWebView !== undefined;
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const shareCard = (cardData: any) => {
    const message = {
      type: 'SHARE_CARD',
      title: "Receipt Voucher " + cardData.voucher.voucherNumber,
      message: cardData.farmerId.name,
    };
    
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
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
      
      window.ReactNativeWebView.postMessage(JSON.stringify(printData));
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
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-gray-200">
        {/* Top row: Badge and farmer name */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
              RECEIPT #{order.voucher.voucherNumber}
            </span>
            <div className="text-xs text-gray-600 truncate">
              <span className="font-medium">{order.farmerId.name}</span>
            </div>
          </div>
          {isWebView() && (
            <div className="flex items-center gap-1">
              <div 
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => shareCard(order)}
              >
                <Share2 size={12} />
                <span className="hidden sm:inline">Share</span>
              </div>
              <div className="text-sm text-gray-600 cursor-pointer p-1" onClick={toggleCollapse}>
                {isCollapsed ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom row: Stock, date, and action buttons */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <span>Stock: <span className="font-medium">{order.currentStockAtThatTime}</span></span>
            <span className="font-medium">{formatDate(order.dateOfSubmission)}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            >
              <Pencil size={12} />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-colors"
            >
              <Printer size={12} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Collapsible */}
      {(!isWebView() || !isCollapsed) && (
        <div className="space-y-6">
          {/* Farmer Details Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Farmer Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Name</span>
                <p className="font-medium text-gray-900 mt-1">{order.farmerId.name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Farmer ID</span>
                <p className="font-mono text-sm text-gray-900 mt-1 break-all">{order.farmerId.farmerId}</p>
              </div>
            </div>
          </div>

          {order.orderDetails.map((detail, index) => (
            <div key={index} className="space-y-4">

              {/* Variety and Location Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
                <h4 className="text-base font-medium text-gray-900">{detail.variety}</h4>
                <span className="text-sm text-gray-600">
                  <span className="text-gray-500">Location:</span> <span className="font-medium">{detail.location}</span>
                </span>
              </div>

              {/* Bag Sizes Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Bag Size</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {detail.bagSizes
                      .sort((a, b) => {
                        const aIndex = bagSizes.indexOf(a.size);
                        const bIndex = bagSizes.indexOf(b.size);
                        return aIndex - bIndex;
                      })
                      .map((bagSize, idx) => {
                        const current = bagSize.quantity?.currentQuantity || 0;
                        const initial = bagSize.quantity?.initialQuantity || 0;
                        const utilizationPercentage = initial > 0 ? ((initial - current) / initial * 100) : 0;

                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{bagSize.size}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-medium">
                                <span className="text-green-600">{current}</span>
                                <span className="text-gray-400 mx-1">/</span>
                                <span className="text-gray-600">{initial}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-gray-600">{utilizationPercentage.toFixed(0)}%</span>
                                <div className="w-12 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Types</p>
                  <p className="text-lg font-bold text-gray-900">{detail.bagSizes.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Current</p>
                  <p className="text-lg font-bold text-green-600">
                    {detail.bagSizes.reduce((sum, bag) => sum + (bag.quantity?.currentQuantity || 0), 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Initial</p>
                  <p className="text-lg font-bold text-blue-600">
                    {detail.bagSizes.reduce((sum, bag) => sum + (bag.quantity?.initialQuantity || 0), 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Utilization</p>
                  <p className="text-lg font-bold text-purple-600">
                    {Math.round(
                      detail.bagSizes.reduce((sum, bag) => {
                        const initial = bag.quantity?.initialQuantity || 0;
                        const current = bag.quantity?.currentQuantity || 0;
                        return sum + (initial > 0 ? ((initial - current) / initial * 100) : 0);
                      }, 0) / detail.bagSizes.length
                    )}%
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Remarks Section */}
          {order.remarks && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Remarks</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{order.remarks}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptVoucherCard;