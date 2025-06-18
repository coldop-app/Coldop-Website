import { Order, StoreAdmin } from '@/utils/types';
import { Printer } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import OrderVoucherPDF from '../pdf/OrderVoucherPDF';
import * as ReactDOM from 'react-dom/client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface DeliveryVoucherCardProps {
  order: Order;
}

const DeliveryVoucherCard = ({ order }: DeliveryVoucherCardProps) => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo) as StoreAdmin | null;

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
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            DELIVERY #{order.voucher.voucherNumber}
          </span>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{order.orderDetails[0]?.variety}</span>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-colors"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Stock: <span className="font-medium">{order.currentStockAtThatTime}</span></span>
          <span className="font-medium">{formatDate(order.dateOfExtraction)}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Inventory Table */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Inventory Details</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Receipt #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Bag Size</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Initial</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Removed</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.orderDetails.map((detail, detailIndex) => (
                  detail.bagSizes.map((bagSize, bagIndex) => {
                    const incomingBagSize = detail.incomingOrder?.incomingBagSizes.find(
                      b => b.size === bagSize.size
                    );
                    const availableQuantity = incomingBagSize
                      ? incomingBagSize.currentQuantity
                      : 0;

                    return (
                      <tr key={`${detailIndex}-${bagIndex}`} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {bagIndex === 0 ? (
                            <span className="font-medium text-gray-900">
                              {detail.incomingOrder?.location || 'N/A'}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {bagIndex === 0 && detail.incomingOrder ? (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              #{detail.incomingOrder.voucher.voucherNumber}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{bagSize.size}</td>
                        <td className="py-3 px-4 text-right">{incomingBagSize?.initialQuantity || 0}</td>
                        <td className="py-3 px-4 text-right text-red-600 font-medium">
                          {bagSize.quantityRemoved || 0}
                        </td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">
                          {availableQuantity}
                        </td>
                      </tr>
                    );
                  })
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Farmer Details & Remarks */}
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

          {/* Remarks Card */}
          {order.remarks && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Remarks</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{order.remarks}</p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Locations</span>
                <span className="font-medium">
                  {new Set(order.orderDetails.map(d => d.incomingOrder?.location).filter(Boolean)).size}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Bag Types</span>
                <span className="font-medium">
                  {new Set(order.orderDetails.flatMap(d => d.bagSizes.map(b => b.size))).size}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Removed</span>
                <span className="font-medium text-red-600">
                  {order.orderDetails.reduce((total, detail) =>
                    total + detail.bagSizes.reduce((sum, bag) =>
                      sum + (bag.quantityRemoved || 0), 0
                    ), 0
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-300">
                <span className="text-gray-600">Current Stock</span>
                <span className="font-bold text-gray-900">{order.currentStockAtThatTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryVoucherCard;