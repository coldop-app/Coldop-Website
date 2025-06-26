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
    // Open in new window
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
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 hover:border-primary/10 hover:shadow-md">
      {/* Header Section */}
      <div className="bg-gray-50/50 border-b border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">
                Receipt #{order.voucher.voucherNumber}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <Pencil size={14} />
                Edit
              </button>
              {isWebView() && (
                <>
                  <button
                    onClick={() => shareCard(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200"
                  >
                    <Share2 size={14} />
                    Share
                  </button>
                  <button
                    onClick={toggleCollapse}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200"
                  >
                    {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    {isCollapsed ? 'Expand' : 'Collapse'}
                  </button>
                </>
              )}
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200"
              >
                <Printer size={14} />
                Print
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Stock: <span className="font-medium text-gray-900">{order.currentStockAtThatTime}</span></span>
            <span className="font-medium text-gray-900">{formatDate(order.dateOfSubmission)}</span>
          </div>
        </div>
      </div>

      {/* Main Content - Collapsible */}
      {(!isWebView() || !isCollapsed) && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Farmer Details Card */}
          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Farmer Details</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gray-50/50 rounded-xl px-4 py-3 border border-gray-100">
                <h4 className="text-base font-medium text-gray-900">{detail.variety}</h4>
                <span className="text-sm text-gray-600">
                  <span className="text-gray-500">Location:</span> <span className="font-medium">{detail.location}</span>
                </span>
              </div>

              {/* Bag Sizes Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Bag Size</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Usage Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detail.bagSizes
                      .sort((a, b) => {
                        const aIndex = bagSizes.indexOf(a.size);
                        const bIndex = bagSizes.indexOf(b.size);
                        return aIndex - bIndex;
                      })
                      .map((bagSize, idx) => {
                        const current = bagSize.quantity?.currentQuantity || 0;
                        const initial = bagSize.quantity?.initialQuantity || 0;
                        const usagePercentage = initial > 0 ? ((initial - current) / initial * 100) : 0;

                        return (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-4 font-medium text-gray-900">{bagSize.size}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-medium">
                                <span className="text-primary">{current}</span>
                                <span className="text-gray-400 mx-1">/</span>
                                <span className="text-gray-700">{initial}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-gray-700">{usagePercentage.toFixed(0)}% Used</span>
                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                  <div
                                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gradient-to-r from-gray-50/50 to-primary/5 rounded-xl p-4 border border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Types</p>
                  <p className="text-lg font-bold text-gray-900">{detail.bagSizes.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Available</p>
                  <p className="text-lg font-bold text-primary">
                    {detail.bagSizes.reduce((sum, bag) => sum + (bag.quantity?.currentQuantity || 0), 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Initial</p>
                  <p className="text-lg font-bold text-gray-900">
                    {detail.bagSizes.reduce((sum, bag) => sum + (bag.quantity?.initialQuantity || 0), 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Usage</p>
                  <p className="text-lg font-bold text-gray-700">
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
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="bg-yellow-50/50 rounded-xl p-4 border border-yellow-100">
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