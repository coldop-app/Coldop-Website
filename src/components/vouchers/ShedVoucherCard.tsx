import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Share2 } from "lucide-react";

interface WebViewMessage {
  type: "SHARE_CARD";
  title: string;
  message: string;
}

// Add PDF message interface
interface WebViewPDFMessage {
  type: "OPEN_PDF_NATIVE";
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
import { Order, StoreAdmin } from "@/utils/types";
import { Printer } from "lucide-react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import ShedVoucherPDF from "../pdf/ShedVoucherPDF.tsx";
import * as ReactDOM from "react-dom/client";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface ShedVoucherCardProps {
  order: Order;
}

const ShedVoucherCard = ({ order }: ShedVoucherCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // Loading state for PDF generation

  const adminInfo = useSelector(
    (state: RootState) => state.auth.adminInfo
  ) as StoreAdmin | null;

  // Sort bag sizes according to admin preferences using useMemo
  const sortBagSizes = useMemo(() => {
    if (!adminInfo?.preferences?.bagSizes) {
      return (bagSizes: string[]) => bagSizes;
    }

    // Create a map of normalized bag size names to their index in admin preferences
    const preferenceOrder = new Map(
      adminInfo.preferences.bagSizes.map((size, index) => [
        size.toLowerCase().replace(/[-\s]/g, ""), // Normalize by removing hyphens and spaces
        index,
      ])
    );

    // Return a sorting function
    return (bagSizes: string[]) => {
      if (!bagSizes.length) return bagSizes;

      return [...bagSizes].sort((a, b) => {
        // Normalize the bag size names for comparison
        const aNormalized = a.toLowerCase().replace(/[-\s]/g, "");
        const bNormalized = b.toLowerCase().replace(/[-\s]/g, "");

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
      type: "SHARE_CARD",
      title: "Shed Voucher " + cardData.gatePass.gatePassNumber,
      message: JSON.stringify(cardData),
    };

    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  };

  // Calculate total quantity taken out
  const calculateTotalTakenOut = () => {
    if (!order.orderDetails) return 0;
    return order.orderDetails.reduce(
      (total, detail) =>
        total +
        detail.bagSizes.reduce(
          (sum, bag) => sum + (bag.quantityTakenOut || 0),
          0
        ),
      0
    );
  };

  // Calculate total quantity rejected
  const calculateTotalRejected = () => {
    if (!order.orderDetails) return 0;
    return order.orderDetails.reduce(
      (total, detail) =>
        total +
        detail.bagSizes.reduce(
          (sum, bag) => sum + (bag.quantityRejected || 0),
          0
        ),
      0
    );
  };

  // Calculate total quantity restored
  const calculateTotalRestored = () => {
    if (!order.orderDetails) return 0;
    return order.orderDetails.reduce(
      (total, detail) =>
        total +
        detail.bagSizes.reduce(
          (sum, bag) => sum + (bag.quantityRestored || 0),
          0
        ),
      0
    );
  };

  // Get all unique varieties
  const getAllVarieties = () => {
    if (!order.orderDetails) return [];
    return Array.from(
      new Set(
        order.orderDetails
          .map((detail) => detail.variety)
          .filter((variety) => variety)
      )
    );
  };

  // Calculate total quantity taken out for a specific variety
  const calculateVarietyTotalTakenOut = (variety: string) => {
    if (!order.orderDetails) return 0;
    return order.orderDetails
      .filter((detail) => detail.variety === variety)
      .reduce(
        (total, detail) =>
          total +
          detail.bagSizes.reduce(
            (sum, bag) => sum + (bag.quantityTakenOut || 0),
            0
          ),
        0
      );
  };

  const handlePrint = async () => {
    if (!adminInfo) {
      alert("Admin information not available for PDF generation");
      return;
    }

    if (isWebView()) {
      // Set loading state for WebView
      setIsGeneratingPDF(true);

      try {
        console.log("Starting PDF generation for Shed Voucher...");

        const pdfDoc = <ShedVoucherPDF order={order} adminInfo={adminInfo} />;

        // Generate PDF as blob
        const pdfBlob = await pdf(pdfDoc).toBlob();
        console.log("PDF blob generated, size:", pdfBlob.size, "bytes");

        // Convert blob to base64
        const reader = new FileReader();
        reader.onload = function () {
          const base64Data = (reader.result as string).split(",")[1]; // Remove data:application/pdf;base64, prefix

          const fileName = `Shed_Voucher_${order.gatePass.gatePassNumber}_${
            new Date().toISOString().split("T")[0]
          }.pdf`;

          const message: WebViewPDFMessage = {
            type: "OPEN_PDF_NATIVE",
            title: `Shed Voucher ${order.gatePass.gatePassNumber}`,
            fileName: fileName,
            pdfData: base64Data,
          };

          window.ReactNativeWebView?.postMessage(JSON.stringify(message));
          console.log("PDF data sent to React Native");

          // Reset loading state after successful send
          setIsGeneratingPDF(false);
        };

        reader.onerror = function () {
          console.error("Error converting PDF to base64");
          alert("Error preparing PDF for native viewer. Please try again.");
          // Reset loading state on error
          setIsGeneratingPDF(false);
        };

        reader.readAsDataURL(pdfBlob);
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
        // Reset loading state on error
        setIsGeneratingPDF(false);
      }
    } else {
      // Handle printing in web browser (existing PDF functionality)
      const printWindow = window.open("", "_blank");
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
        const root = printWindow.document.getElementById("root");
        if (root) {
          ReactDOM.createRoot(root).render(
            <PDFViewer width="100%" height="100%">
              <ShedVoucherPDF order={order} adminInfo={adminInfo} />
            </PDFViewer>
          );
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 hover:border-yellow-500/20 hover:shadow-md">
      {/* Header Section */}
      <div className="p-3 sm:p-4 lg:p-5">
        {/* Top Row - Voucher Number and Stock */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm font-medium text-gray-900">
              Shed Voucher:{" "}
              <span className="text-yellow-600">
                {order.gatePass.gatePassNumber}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
              Date:{" "}
              <span className="font-medium text-gray-900">
                {order.dateOfExtraction || "N/A"}
              </span>
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
              C.Stock:{" "}
              <span className="font-medium text-gray-900">
                {order.currentStockAtThatTime}
              </span>
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
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getAllVarieties().length > 0
                    ? getAllVarieties().join(", ")
                    : "N/A"}
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-gray-500 block">Taken Out</span>
                <p className="text-sm font-medium text-gray-900">
                  {calculateTotalTakenOut()}
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-gray-500 block">Rejected</span>
                <p className="text-sm font-medium text-gray-900">
                  {calculateTotalRejected()}
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-gray-500 block">Restored</span>
                <p className="text-sm font-medium text-gray-900">
                  {calculateTotalRestored()}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:order-1 lg:order-2">
              <button
                onClick={handlePrint}
                disabled={isWebView() && isGeneratingPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWebView() && isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-gray-600"></div>
                    <span className="hidden xs:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <Printer size={14} />
                    <span className="hidden xs:inline">Print</span>
                  </>
                )}
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
        {order.farmerId && (
              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Farmer Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      Name
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {order.farmerId?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      Farmer ID
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {order.farmerId?.farmerId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      Address
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {order.farmerId?.address || "N/A"}
                    </p>
            </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      Mobile Number
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {order.farmerId?.mobileNumber || "N/A"}
                    </p>
              </div>
            </div>
          </div>
        )}

            {/* Shed Processing Details */}
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Shed Processing Details
              </h3>
              <div className="space-y-4">
                {getAllVarieties().map((variety, varietyIndex) => {
                  const varietyDetails = order.orderDetails?.filter(
                    (detail) => detail.variety === variety
                  ) || [];

                  // Get all unique bag sizes for this variety
                  const varietyBagSizes = Array.from(
                    new Set(
                      varietyDetails.flatMap((d) =>
                        d.bagSizes.map((b) => b.size)
                      )
                    )
                  );

                  if (varietyBagSizes.length === 0) {
                    return (
                      <div key={varietyIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          {variety}
                        </h4>
                        <p className="text-sm text-gray-500 italic">No items processed</p>
                      </div>
                    );
                  }

                  return (
                    <div key={varietyIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        {variety}
            </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left py-2 px-3 font-medium text-gray-900 border-b border-gray-200">
                                Bag Type
                              </th>
                              <th className="text-center py-2 px-3 font-medium text-gray-900 border-b border-gray-200">
                                Taken Out
                              </th>
                              <th className="text-center py-2 px-3 font-medium text-gray-900 border-b border-gray-200">
                                Rejected
                              </th>
                              <th className="text-center py-2 px-3 font-medium text-gray-900 border-b border-gray-200">
                                Restored
                              </th>
                              <th className="text-center py-2 px-3 font-medium text-gray-900 border-b border-gray-200">
                                Current
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {sortBagSizes(varietyBagSizes).map((bagSize, idx) => {
                              const bagData = varietyDetails.reduce(
                                (acc, detail) => {
                                  const bag = detail.bagSizes.find((b) => b.size === bagSize);
                                  if (bag) {
                                    acc.takenOut += bag.quantityTakenOut || 0;
                                    acc.rejected += bag.quantityRejected || 0;
                                    acc.restored += bag.quantityRestored || 0;
                                    acc.current += bag.currentQuantity || 0;
                                  }
                                  return acc;
                                },
                                { takenOut: 0, rejected: 0, restored: 0, current: 0 }
                              );

                              return (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="py-2 px-3 font-medium text-gray-900">
                                    {bagSize}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className="font-medium text-blue-600">
                                      {bagData.takenOut}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className="font-medium text-red-600">
                                      {bagData.rejected}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className="font-medium text-green-600">
                                      {bagData.restored}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className="font-medium text-gray-600">
                                      {bagData.current}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-gray-50 font-medium">
                              <td className="py-2 px-3 text-gray-900">
                                Subtotal
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="font-medium text-blue-600">
                                  {calculateVarietyTotalTakenOut(variety)}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="font-medium text-red-600">
                                  {varietyDetails.reduce(
                                    (total, detail) =>
                                      total +
                                      detail.bagSizes.reduce(
                                        (sum, bag) => sum + (bag.quantityRejected || 0),
                                        0
                                      ),
                                    0
                                  )}
                    </span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="font-medium text-green-600">
                                  {varietyDetails.reduce(
                                    (total, detail) =>
                                      total +
                                      detail.bagSizes.reduce(
                                        (sum, bag) => sum + (bag.quantityRestored || 0),
                                        0
                                      ),
                                    0
                                  )}
                      </span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="font-medium text-gray-600">
                                  {varietyDetails.reduce(
                                    (total, detail) =>
                                      total +
                                      detail.bagSizes.reduce(
                                        (sum, bag) => sum + (bag.currentQuantity || 0),
                                        0
                                      ),
                                    0
                                  )}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                  </div>
                          </div>
                  );
                })}

                {/* Grand Total */}
                <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Total Taken Out</div>
                      <div className="text-sm font-semibold text-blue-600">
                        {calculateTotalTakenOut()}
                          </div>
                            </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Total Rejected</div>
                      <div className="text-sm font-semibold text-red-600">
                        {calculateTotalRejected()}
                        </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Total Restored</div>
                      <div className="text-sm font-semibold text-green-600">
                        {calculateTotalRestored()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Net Processed</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {calculateTotalTakenOut() - calculateTotalRejected() - calculateTotalRestored()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Detailed Breakdown
              </h3>
              <div className="space-y-6">
                {getAllVarieties().map((variety, varietyIndex) => {
                  const varietyDetails = order.orderDetails?.filter(
                    (detail) => detail.variety === variety
                  ) || [];

                  // Filter out details with empty bagSizes
                  const detailsWithItems = varietyDetails.filter(
                    (detail) => detail.bagSizes && detail.bagSizes.length > 0
                  );

                  if (detailsWithItems.length === 0) {
                    return (
                      <div key={varietyIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          {variety}
                        </h4>
                        <p className="text-sm text-gray-500 italic">No detailed breakdown available</p>
          </div>
                    );
                  }

                  return (
                    <div key={varietyIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">
                        {variety}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left py-3 px-4 font-medium text-gray-900">
                                Bag Type
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900">
                                Location
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900">
                                R. Voucher
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-gray-900">
                                Taken Out
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-gray-900">
                                Rejected
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-gray-900">
                                Restored
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-gray-900">
                                Current
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {detailsWithItems.map((detail, detailIndex) =>
                              detail.bagSizes.map((bagSize, bagIndex) => {
                                return (
                                  <tr
                                    key={`${varietyIndex}-${detailIndex}-${bagIndex}`}
                                    className="hover:bg-gray-50/50 transition-colors"
                                  >
                                    <td className="py-3 px-4 font-medium text-gray-900">
                                      {bagSize.size}
                                    </td>
                                    <td className="py-3 px-4 text-gray-700">
                                      {bagSize.location || "N/A"}
                                    </td>
                                    <td className="py-3 px-4">
                                      {detail.incomingOrder ? (
                                        <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                          <span className="text-sm font-medium text-gray-900">
                                            {
                                              detail.incomingOrder.gatePass
                                                .gatePassNumber
                                            }
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">—</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-right text-blue-600 font-medium">
                                      {bagSize.quantityTakenOut || 0}
                                    </td>
                                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                                      {bagSize.quantityRejected || 0}
                                    </td>
                                    <td className="py-3 px-4 text-right text-green-600 font-medium">
                                      {bagSize.quantityRestored || 0}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-600 font-medium">
                                      {bagSize.currentQuantity || 0}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                </div>
                  );
                })}
              </div>
            </div>

            {/* Remarks Section */}
            {order.remarks && (
              <div className="bg-yellow-50/50 rounded-xl p-4 border border-yellow-100">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Remarks
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed break-words">
                  {order.remarks}
                </p>
          </div>
        )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShedVoucherCard;
