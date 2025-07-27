import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Share2 } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo) as StoreAdmin | null;

  // Sort bag sizes according to admin preferences using useMemo
  const sortBagSizes = useMemo(() => {
    if (!adminInfo?.preferences?.bagSizes) {
      return (bagSizes: string[]) => bagSizes;
    }

    // Create a map of normalized bag size names to their index in admin preferences
    const preferenceOrder = new Map(
      adminInfo.preferences.bagSizes.map((size, index) => [
        size.toLowerCase().replace(/[-\s]/g, ''), // Normalize by removing hyphens and spaces
        index
      ])
    );

    // Return a sorting function
    return (bagSizes: string[]) => {
      if (!bagSizes.length) return bagSizes;

      return [...bagSizes].sort((a, b) => {
        // Normalize the bag size names for comparison
        const aNormalized = a.toLowerCase().replace(/[-\s]/g, '');
        const bNormalized = b.toLowerCase().replace(/[-\s]/g, '');

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

  const isWebView = () => {
    return window.ReactNativeWebView !== undefined;
  };

  const shareCard = (cardData: Order) => {
    const message: WebViewMessage = {
      type: 'SHARE_CARD',
      title: "Delivery Voucher " + cardData.voucher.voucherNumber,
      message: JSON.stringify(cardData),
    };

    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  };

  // Calculate lot number (total quantity removed)
  const calculateLotNo = () => {
    return order.orderDetails.reduce((total, detail) =>
      total + detail.bagSizes.reduce((sum, bag) =>
        sum + (bag.quantityRemoved || 0), 0
      ), 0
    );
  };

  // Sort bag sizes for detailed breakdown table
  const sortedOrderDetails = useMemo(() => {
    return order.orderDetails.map(detail => ({
      ...detail,
      bagSizes: sortBagSizes(detail.bagSizes.map(bag => bag.size)).map(sortedSize =>
        detail.bagSizes.find(bag => bag.size === sortedSize)!
      )
    }));
  }, [order.orderDetails, sortBagSizes]);

  const handlePrint = () => {
    if (isWebView()) {
      const printData = {
        type: 'PRINT_RECEIPT',
        voucherType: 'DELIVERY',
        voucherNumber: order.voucher.voucherNumber,
        date: order.dateOfExtraction,
        variety: order.orderDetails[0]?.variety || '',
        farmerName: order.farmerId.name,
        farmerId: order.farmerId.farmerId,
        currentStock: order.currentStockAtThatTime,
        remarks: order.remarks || '',
        orderDetails: order.orderDetails.map(detail => ({
          variety: detail.variety,
          location: detail.incomingOrder?.location || '',
          receiptNumber: detail.incomingOrder?.voucher.voucherNumber || '',
          bagSizes: detail.bagSizes.map(bag => {
            const incomingBagSize = detail.incomingOrder?.incomingBagSizes.find(
              b => b.size === bag.size
            );
            return {
              size: bag.size,
              initialQuantity: incomingBagSize?.initialQuantity || 0,
              quantityRemoved: bag.quantityRemoved || 0,
              availableQuantity: incomingBagSize?.currentQuantity || 0
            };
          })
        })),
        summary: {
          totalLocations: new Set(order.orderDetails.map(d => d.incomingOrder?.location).filter(Boolean)).size,
          totalBagTypes: new Set(order.orderDetails.flatMap(d => d.bagSizes.map(b => b.size))).size,
          totalRemoved: order.orderDetails.reduce((total, detail) =>
            total + detail.bagSizes.reduce((sum, bag) =>
              sum + (bag.quantityRemoved || 0), 0
            ), 0
          )
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
            <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm font-medium text-gray-900">
              Delivery Voucher: <span className="text-rose-600">{order.voucher.voucherNumber}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
              Date: <span className="font-medium text-gray-900">{order.dateOfExtraction || 'N/A'}</span>
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
                <p className="text-sm font-medium text-gray-900">{calculateLotNo()}</p>
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
            {/* Net Outgoing Details Summary */}
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Net Outgoing Details</h3>

                             {/* Mobile View - Stacked Layout */}
               <div className="block sm:hidden space-y-3">
                 {sortBagSizes(Array.from(new Set(order.orderDetails.flatMap(d => d.bagSizes.map(b => b.size))))).map((bagSize, idx) => {
                   const totalRemoved = order.orderDetails.reduce((total, detail) =>
                     total + detail.bagSizes.filter(bag => bag.size === bagSize).reduce((sum, bag) =>
                       sum + (bag.quantityRemoved || 0), 0
                     ), 0
                   );

                   return (
                     <div key={idx} className="bg-white rounded-lg p-3 border border-gray-100">
                       <div className="flex justify-between items-center">
                         <span className="text-sm font-medium text-gray-900">{bagSize}</span>
                         <span className="text-sm font-medium text-rose-600">{totalRemoved}</span>
                       </div>
                     </div>
                   );
                 })}

                 {/* Total Row for Mobile */}
                 <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-semibold text-gray-900">Total</span>
                     <span className="text-sm font-semibold text-rose-600">{calculateLotNo()}</span>
                   </div>
                 </div>
               </div>

               {/* Desktop View - Table Layout */}
               <div className="hidden sm:block">
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm border-collapse">
                     <thead>
                       <tr className="bg-gray-50">
                         {sortBagSizes(Array.from(new Set(order.orderDetails.flatMap(d => d.bagSizes.map(b => b.size))))).map((bagSize, idx) => (
                           <th key={idx} className="text-center py-3 px-3 font-medium text-gray-900 border-b border-gray-200">
                             {bagSize}
                           </th>
                         ))}
                         <th className="text-center py-3 px-3 font-medium text-gray-900 border-b border-gray-200">
                           Total
                         </th>
                       </tr>
                     </thead>
                     <tbody>
                       <tr className="border-b border-gray-100">
                         {sortBagSizes(Array.from(new Set(order.orderDetails.flatMap(d => d.bagSizes.map(b => b.size))))).map((bagSize, idx) => {
                           const totalRemoved = order.orderDetails.reduce((total, detail) =>
                             total + detail.bagSizes.filter(bag => bag.size === bagSize).reduce((sum, bag) =>
                               sum + (bag.quantityRemoved || 0), 0
                             ), 0
                           );

                           return (
                             <td key={idx} className="py-3 px-3 text-center">
                               <span className="font-medium text-rose-600">{totalRemoved}</span>
                             </td>
                           );
                         })}
                         {/* Total */}
                         <td className="py-3 px-3 text-center">
                           <span className="font-semibold text-rose-600">{calculateLotNo()}</span>
                         </td>
                       </tr>
                     </tbody>
                   </table>
                 </div>
               </div>
            </div>

                         {/* Detailed Breakdown */}
             <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
               <h3 className="text-sm font-medium text-gray-900 mb-4">Detailed Breakdown</h3>

               {/* Mobile View - Stacked Cards */}
               <div className="block sm:hidden space-y-3">
                 {sortedOrderDetails.map((detail, detailIndex) => (
                   detail.bagSizes.map((bagSize, bagIndex) => {
                     const incomingBagSize = detail.incomingOrder?.incomingBagSizes.find(
                       b => b.size === bagSize.size
                     );
                     const currentQuantity = incomingBagSize?.currentQuantity || 0;
                     const removedQuantity = bagSize.quantityRemoved || 0;
                     const availableQuantity = currentQuantity - removedQuantity;

                     return (
                       <div key={`${detailIndex}-${bagIndex}`} className="bg-white rounded-lg p-3 border border-gray-100">
                         <div className="space-y-2">
                           <div className="flex justify-between items-center">
                             <span className="text-sm font-medium text-gray-900">{bagSize.size}</span>
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                               <span className="text-xs font-medium text-gray-900">
                                 {detail.incomingOrder?.voucher.voucherNumber || '—'}
                               </span>
                             </div>
                           </div>
                           <div className="text-xs text-gray-600">
                             <span className="font-medium">Address:</span> {detail.incomingOrder?.location || 'N/A'}
                           </div>
                           <div className="grid grid-cols-3 gap-2 text-xs">
                             <div className="text-center">
                               <span className="block text-gray-500">Current</span>
                               <span className="font-medium text-gray-900">{currentQuantity}</span>
                             </div>
                             <div className="text-center">
                               <span className="block text-gray-500">Issued</span>
                               <span className="font-medium text-rose-600">{removedQuantity}</span>
                             </div>
                             <div className="text-center">
                               <span className="block text-gray-500">Available</span>
                               <span className="font-medium text-primary">{availableQuantity}</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     );
                   })
                 ))}
               </div>

               {/* Desktop View - Table Layout */}
               <div className="hidden sm:block">
                 <div className="overflow-x-auto rounded-xl border border-gray-100">
                   <table className="w-full text-sm">
                     <thead>
                       <tr className="bg-gray-50/50">
                         <th className="text-left py-3 px-4 font-medium text-gray-900">Bag Type</th>
                         <th className="text-left py-3 px-4 font-medium text-gray-900">Address</th>
                         <th className="text-left py-3 px-4 font-medium text-gray-900">R. Voucher</th>
                         <th className="text-right py-3 px-4 font-medium text-gray-900">Current Qty.</th>
                         <th className="text-right py-3 px-4 font-medium text-gray-900">Qty. Issued</th>
                         <th className="text-right py-3 px-4 font-medium text-gray-900">Available</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {sortedOrderDetails.map((detail, detailIndex) => (
                         detail.bagSizes.map((bagSize, bagIndex) => {
                           const incomingBagSize = detail.incomingOrder?.incomingBagSizes.find(
                             b => b.size === bagSize.size
                           );
                           const currentQuantity = incomingBagSize?.currentQuantity || 0;
                           const removedQuantity = bagSize.quantityRemoved || 0;
                           const availableQuantity = currentQuantity - removedQuantity;

                           return (
                             <tr key={`${detailIndex}-${bagIndex}`} className="hover:bg-gray-50/50 transition-colors">
                               <td className="py-3 px-4 font-medium text-gray-900">{bagSize.size}</td>
                               <td className="py-3 px-4 text-gray-700">
                                 {detail.incomingOrder?.location || 'N/A'}
                               </td>
                               <td className="py-3 px-4">
                                 {detail.incomingOrder ? (
                                   <div className="flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                     <span className="text-sm font-medium text-gray-900">
                                       {detail.incomingOrder.voucher.voucherNumber}
                                     </span>
                                   </div>
                                 ) : (
                                   <span className="text-gray-400">—</span>
                                 )}
                               </td>
                               <td className="py-3 px-4 text-right text-gray-700">{currentQuantity}</td>
                               <td className="py-3 px-4 text-right text-rose-600 font-medium">
                                 {removedQuantity}
                               </td>
                               <td className="py-3 px-4 text-right text-primary font-medium">
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
             </div>

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

export default DeliveryVoucherCard;