import { Order, StoreAdmin, OrderDetails, BagSize } from "@/utils/types";
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/store";
import { ChevronDown, ChevronUp, Pencil, Share2, Printer } from "lucide-react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import OrderVoucherPDF from "../pdf/OrderVoucherPDF";
import * as ReactDOM from "react-dom/client";
import { toast } from "react-hot-toast";

// Extended BagSize interface to include location property
interface BagSizeWithLocation extends BagSize {
  location?: string;
}

interface SortedOrderDetail extends OrderDetails {
  sortedBagSizes: BagSize[];
}

interface WebViewMessage {
  type: "SHARE_CARD";
  title: string;
  message: string;
}

interface WebViewPDFMessage {
  type: "OPEN_PDF_NATIVE";
  title: string;
  fileName: string;
  pdfData: string;
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const adminInfo = useSelector(
    (state: RootState) => state.auth.adminInfo
  ) as StoreAdmin | null;
  const navigate = useNavigate();

  const sortBagSizes = useMemo(() => {
    if (!adminInfo?.preferences?.bagSizes) {
      return (bagSizes: BagSize[]) => bagSizes;
    }

    const preferenceOrder = new Map(
      adminInfo.preferences.bagSizes.map((size, index) => [
        size.toLowerCase().replace(/[-\\s]/g, ""),
        index,
      ])
    );

    return (bagSizes: BagSize[]) => {
      if (!bagSizes.length) return bagSizes;

      return [...bagSizes].sort((a, b) => {
        const aNormalized = a.size.toLowerCase().replace(/[-\\s]/g, "");
        const bNormalized = b.size.toLowerCase().replace(/[-\\s]/g, "");

        const aIndex = preferenceOrder.get(aNormalized);
        const bIndex = preferenceOrder.get(bNormalized);

        if (aIndex !== undefined && bIndex !== undefined) {
          return aIndex - bIndex;
        }

        if (aIndex !== undefined) return -1;
        if (bIndex !== undefined) return 1;

        return 0;
      });
    };
  }, [adminInfo?.preferences?.bagSizes]);

  const sortedOrderDetails = useMemo(() => {
    if (!order.orderDetails || order.isNullVoucher) {
      return [];
    }
    return order.orderDetails.map((detail) => ({
      ...detail,
      sortedBagSizes: sortBagSizes(detail.bagSizes),
    })) as SortedOrderDetail[];
  }, [order.orderDetails, sortBagSizes, order.isNullVoucher]);

  const calculateLotNo = (orderDetails: OrderDetails[] | null) => {
    if (!orderDetails || orderDetails.length === 0) {
      return 0;
    }
    return orderDetails[0]?.bagSizes?.reduce(
      (sum: number, bagSize: BagSize) =>
        sum + (bagSize.quantity?.initialQuantity || 0),
      0
    ) || 0;
  };

  const formatBagSizeName = (size: string): string => {
    return size;
  };

  const isWebView = () => {
    return window.ReactNativeWebView !== undefined;
  };

  const shareCard = (order: Order) => {
    const orderSummary = `Receipt Voucher: ${order.gatePass?.gatePassNumber || "N/A"}
Date: ${order.dateOfSubmission}
Party: ${order.farmerId?.name || "N/A"} (${order.farmerId?.farmerId || "N/A"})
Variety: ${order.orderDetails?.[0]?.variety || "N/A"}
Generation: ${order.generation}
Rouging: ${order.rouging}
Tuber Type: ${order.tuberType}
Grader: ${order.grader}
Bag Type: ${order.bagType}
Weighed: ${order.weighedStatus ? "Yes" : "No"}
Approx Weight: ${order.approxWeight}
Lot No: ${calculateLotNo(order.orderDetails)}
Current Stock: ${order.currentStockAtThatTime}
${order.remarks ? `Remarks: ${order.remarks}` : ""}

Stock Details:
${order.orderDetails
  ?.map((detail) =>
    detail.bagSizes
      .map(
        (bag) =>
          `${bag.size}: ${bag.quantity?.currentQuantity || 0}/${
            bag.quantity?.initialQuantity || 0
          }`
      )
      .join("\\n")
  )
  .join("\\n") || "No stock details available"}`;

    const message: WebViewMessage = {
      type: "SHARE_CARD",
      title: "Receipt Voucher " + (order.gatePass?.gatePassNumber || "N/A"),
      message: orderSummary,
    };

    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  };

  const handleEdit = () => {
    const hasOutgoingOrders = order.orderDetails?.some((detail) =>
      detail.bagSizes.some(
        (bagSize) =>
          (bagSize.quantity?.initialQuantity || 0) !==
          (bagSize.quantity?.currentQuantity || 0)
      )
    ) || false;

    if (hasOutgoingOrders) {
      toast.error(
        "Edit is not allowed for this receipt as outgoing has been done from it"
      );
      return;
    }

    navigate("/erp/incoming-order/edit", { state: { order } });
  };

  const handlePrint = async () => {
    if (!adminInfo) {
      alert("Admin information not available for PDF generation");
      return;
    }

    if (isWebView()) {
      setIsGeneratingPDF(true);

      try {
        console.log("Starting PDF generation for Receipt Voucher...");

        // Log the complete order data being sent to PDF
        console.log("=== ORDER DATA SENT TO PDF ===");
        console.log("Order:", JSON.stringify(order, null, 2));
        console.log("Order Details:", order.orderDetails);
        console.log("Farmer Info:", order.farmerId);
        console.log("Gate Pass:", order.gatePass);
        console.log("Order Properties:", {
          dateOfSubmission: order.dateOfSubmission,
          generation: order.generation,
          rouging: order.rouging,
          tuberType: order.tuberType,
          grader: order.grader,
          bagType: order.bagType,
          weighedStatus: order.weighedStatus,
          approxWeight: order.approxWeight,
          currentStockAtThatTime: order.currentStockAtThatTime,
          remarks: order.remarks,
          createdAt: order.createdAt
        });

        // Log the admin info being sent to PDF
        console.log("=== ADMIN INFO SENT TO PDF ===");
        console.log("Admin Info:", JSON.stringify(adminInfo, null, 2));
        console.log("Cold Storage Details:", adminInfo.coldStorageDetails);
        console.log("Admin Properties:", {
          name: adminInfo.name,
          mobileNumber: adminInfo.mobileNumber,
          imageUrl: adminInfo.imageUrl,
          preferences: adminInfo.preferences
        });

        const pdfDoc = <OrderVoucherPDF order={order} adminInfo={adminInfo} />;
        const pdfBlob = await pdf(pdfDoc).toBlob();
        console.log("PDF blob generated, size:", pdfBlob.size, "bytes");

        const reader = new FileReader();
        reader.onload = function () {
          const base64Data = (reader.result as string).split(",")[1];

          const fileName = `Receipt_Voucher_${order.gatePass?.gatePassNumber || "N/A"}_${
            new Date().toISOString().split("T")[0]
          }.pdf`;

          const message: WebViewPDFMessage = {
            type: "OPEN_PDF_NATIVE",
            title: `Receipt Voucher ${order.gatePass?.gatePassNumber || "N/A"}`,
            fileName: fileName,
            pdfData: base64Data,
          };

          window.ReactNativeWebView?.postMessage(JSON.stringify(message));
          console.log("PDF data sent to React Native");

          setIsGeneratingPDF(false);
        };

        reader.onerror = function () {
          console.error("Error converting PDF to base64");
          alert("Error preparing PDF for native viewer. Please try again.");
          setIsGeneratingPDF(false);
        };

        reader.readAsDataURL(pdfBlob);
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
        setIsGeneratingPDF(false);
      }
    } else {
      const printWindow = window.open("", "_blank");
      if (printWindow && adminInfo) {
        printWindow.document.write(`
          <html>
            <body>
              <div id="root" style="height: 100vh;"></div>
              <script>
                window.onbeforeunload = null;
              </script>
            </body>
          </html>
        `);

        const root = printWindow.document.getElementById("root");
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
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${
      order.isNullVoucher
        ? "border-orange-200 bg-orange-50/30 hover:border-orange-300"
        : "border-gray-100 hover:border-primary/10"
    }`}>
      {/* Header Section */}
      <div className="p-3 sm:p-4 lg:p-5">
        {/* Top Row - Voucher Number and Stock */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              order.isNullVoucher ? "bg-orange-500" : "bg-primary"
            }`}></div>
            <span className="text-sm font-medium text-gray-900">
              {order.isNullVoucher ? "NULL VOUCHER" : "Receipt Voucher"}:{" "}
              <span className={order.isNullVoucher ? "text-orange-600" : "text-primary"}>
                {order.gatePass?.gatePassNumber || "N/A"}
              </span>
            </span>
            {order.isNullVoucher && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                Paper Tampered
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
              Date:{" "}
              <span className="font-medium text-gray-900">
                {order.dateOfSubmission || "N/A"}
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
                  {order.isNullVoucher ? "NULL VOUCHER" : (order.orderDetails?.[0]?.variety || "N/A")}
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-gray-500 block">Lot No</span>
                <p className="text-sm font-medium text-gray-900">
                  {order.gatePass?.gatePassNumber || "N/A"}/{calculateLotNo(order.orderDetails)}
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-gray-500 block">Party Name</span>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {order.isNullVoucher ? "N/A" : (order.farmerId?.name || "N/A")}
                </p>
              </div>
              <div className="min-w-0">
                <span className="text-xs text-gray-500 block">Acc No</span>
                <p className="text-sm font-medium text-gray-900">
                  {order.isNullVoucher ? "N/A" : (order.farmerId?.farmerId || "N/A")}
                </p>
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
            {/* Null Voucher Details */}
            {order.isNullVoucher ? (
              <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-200">
                <h3 className="text-sm font-medium text-orange-800 mb-4">
                  Null Voucher Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-orange-600 block mb-1">
                      Reason
                    </span>
                    <p className="text-sm font-medium text-orange-800">
                      {order.remarks || "NULL VOUCHER - Paper tampered"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-orange-600 block mb-1">
                      Status
                    </span>
                    <p className="text-sm font-medium text-orange-800">
                      No stock impact - Voucher number reserved
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Farmer Details */}
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Farmer Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </>
            )}

            {/* Additional Details - Only for regular orders */}
            {!order.isNullVoucher && (
              <>
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Additional Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    Generation
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {order.generation}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    Rouging
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {order.rouging}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    Tuber Type
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {order.tuberType}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    Grader
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {order.grader}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    Bag Type
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {order.bagType}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    Approx Weight
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {order.approxWeight}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    Weighed Status
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {order.weighedStatus ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stock Details */}
            {sortedOrderDetails.map(
              (detail: SortedOrderDetail, index: number) => (
                <div key={index} className="space-y-4">
                  {/* Mobile View - Single Table Layout */}
                  <div className="block sm:hidden">
                    <div className="overflow-x-auto">
                      <div className="min-w-full">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left py-2 px-2 font-medium text-gray-900 border-b border-gray-200 text-xs">
                                Size
                              </th>
                              <th className="text-center py-2 px-2 font-medium text-gray-900 border-b border-gray-200 text-xs">
                                Qty
                              </th>
                              <th className="text-center py-2 px-2 font-medium text-gray-900 border-b border-gray-200 text-xs">
                                Weight
                              </th>
                              <th className="text-center py-2 px-2 font-medium text-gray-900 border-b border-gray-200 text-xs">
                                Location
                              </th>
                              <th className="text-center py-2 px-2 font-medium text-gray-900 border-b border-gray-200 text-xs">
                                Marka
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.sortedBagSizes.map((bagSize, idx) => (
                              <tr key={idx} className="border-b border-gray-100">
                                <td className="py-2 px-2 text-left font-medium text-gray-900 text-xs">
                                  {formatBagSizeName(bagSize.size)}
                                </td>
                                <td className="py-2 px-2 text-center text-xs">
                                  {(() => {
                                    const qty = bagSize.quantity;
                                    return qty && qty.initialQuantity ? (
                                      <span className="font-medium text-gray-900">
                                        {qty.currentQuantity || 0}/
                                        {qty.initialQuantity}
                                      </span>
                                    ) : (
                                      "-"
                                    );
                                  })()}
                                </td>
                                <td className="py-2 px-2 text-center text-xs">
                                  <span className="font-medium text-gray-900">
                                    {bagSize.approxWeight ? `${bagSize.approxWeight}kg` : "-"}
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-center text-xs">
                                  <span className="font-medium text-gray-900">
                                    {(bagSize as BagSizeWithLocation)
                                      .location || "-"}
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-center text-xs">
                                  {(() => {
                                    const qty = bagSize.quantity;
                                    return qty && qty.initialQuantity ? (
                                      <span className="font-medium text-gray-900">
                                        {order.gatePass?.gatePassNumber || "N/A"}/
                                        {qty.initialQuantity}
                                      </span>
                                    ) : (
                                      "-"
                                    );
                                  })()}
                                </td>
                              </tr>
                            ))}
                            {/* Total Row */}
                            <tr className="border-b border-gray-100 bg-primary/5">
                              <td className="py-2 px-2 text-left font-semibold text-gray-900 text-xs">
                                Total
                              </td>
                              <td className="py-2 px-2 text-center text-xs">
                                <span className="font-semibold text-primary">
                                  {detail.sortedBagSizes.reduce(
                                    (sum: number, bag) =>
                                      sum + (bag.quantity?.currentQuantity || 0),
                                    0
                                  )}
                                  /
                                  {detail.sortedBagSizes.reduce(
                                    (sum: number, bag) =>
                                      sum + (bag.quantity?.initialQuantity || 0),
                                    0
                                  )}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-center text-xs">
                                <span className="font-semibold text-primary">
                                  {detail.sortedBagSizes.reduce(
                                    (sum: number, bag) =>
                                      sum + (bag.approxWeight || 0),
                                    0
                                  ).toFixed(1)}kg
                                </span>
                              </td>
                              <td className="py-2 px-2 text-center text-xs">
                                <span className="font-medium text-gray-500">
                                  -
                                </span>
                              </td>
                              <td className="py-2 px-2 text-center text-xs">
                                <span className="font-medium text-gray-500">
                                  -
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
                              <th className="text-center py-3 px-3 font-medium text-gray-900 border-b border-gray-200">
                                Size
                              </th>
                              <th className="text-center py-3 px-3 font-medium text-gray-900 border-b border-gray-200">
                                Quantity
                              </th>
                              <th className="text-center py-3 px-3 font-medium text-gray-900 border-b border-gray-200">
                                Weight
                              </th>
                              <th className="text-center py-3 px-3 font-medium text-gray-900 border-b border-gray-200">
                                Location
                              </th>
                              <th className="text-center py-3 px-3 font-medium text-gray-900 border-b border-gray-200">
                                Marka
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.sortedBagSizes.map((bagSize, idx) => (
                              <tr key={idx} className="border-b border-gray-100">
                                <td className="py-3 px-3 text-center font-medium text-gray-900">
                                  {formatBagSizeName(bagSize.size)}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {(() => {
                                    const qty = bagSize.quantity;
                                    return qty && qty.initialQuantity ? (
                                      <span className="font-medium text-gray-900">
                                        {qty.currentQuantity || 0}/
                                        {qty.initialQuantity}
                                      </span>
                                    ) : (
                                      "-"
                                    );
                                  })()}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className="font-medium text-gray-900">
                                    {bagSize.approxWeight ? `${bagSize.approxWeight}kg` : "-"}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className="font-medium text-gray-900">
                                    {(bagSize as BagSizeWithLocation)
                                      .location || "-"}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {(() => {
                                    const qty = bagSize.quantity;
                                    return qty && qty.initialQuantity ? (
                                      <span className="font-medium text-gray-900">
                                        {order.gatePass?.gatePassNumber || "N/A"}/
                                        {qty.initialQuantity}
                                      </span>
                                    ) : (
                                      "-"
                                    );
                                  })()}
                                </td>
                              </tr>
                            ))}
                            {/* Total Row */}
                            <tr className="border-b border-gray-100 bg-primary/5">
                              <td className="py-3 px-3 text-center font-semibold text-gray-900">
                                Total
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="font-semibold text-primary">
                                  {detail.sortedBagSizes.reduce(
                                    (sum: number, bag) =>
                                      sum +
                                      (bag.quantity?.currentQuantity || 0),
                                    0
                                  )}
                                  /
                                  {detail.sortedBagSizes.reduce(
                                    (sum: number, bag) =>
                                      sum +
                                      (bag.quantity?.initialQuantity || 0),
                                    0
                                  )}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="font-semibold text-primary">
                                  {detail.sortedBagSizes.reduce(
                                    (sum: number, bag) =>
                                      sum + (bag.approxWeight || 0),
                                    0
                                  ).toFixed(1)}kg
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="font-medium text-gray-500">
                                  -
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptVoucherCard;
