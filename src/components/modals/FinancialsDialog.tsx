import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import { Loader2, Calendar, IndianRupee } from "lucide-react";

interface FinancialsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: Farmer;
  totalRent: number;
}

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  farmerId: string;
  createdAt: string;
  imageUrl?: string;
  costPerBag?: number | null;
}

const FinancialsDialog: React.FC<FinancialsDialogProps> = ({
  isOpen,
  onClose,
  farmer,
  totalRent,
}) => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  const {
    data: paymentHistory,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["paymentHistory", farmer._id, adminInfo?.token],
    queryFn: () =>
      storeAdminApi.getPaymentHistory(farmer._id, adminInfo?.token || ""),
    enabled: isOpen && !!farmer._id && !!adminInfo?.token,
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl lg:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="border-b pb-4 px-6 pt-6">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Payment History
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-sm text-gray-600">
              Total Rent for Season:
            </span>
            <span className="text-lg font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {formatCurrency(totalRent)}
            </span>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 py-6 px-4 sm:px-6">
          {/* Payment History Section */}
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span>Payment History</span>
              </h3>
              {paymentHistory?.count !== undefined && (
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                  {paymentHistory.count}{" "}
                  {paymentHistory.count === 1 ? "entry" : "entries"}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
                <span className="text-sm sm:text-base text-gray-600 font-medium">
                  Loading payment history...
                </span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
                  <span className="text-red-600 text-xl">⚠</span>
                </div>
                <p className="text-sm sm:text-base text-red-800 font-medium">
                  Failed to load payment history. Please try again.
                </p>
              </div>
            ) : !paymentHistory?.data || paymentHistory.data.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 sm:p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 mb-4">
                  <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium text-base sm:text-lg">
                  No payment history found
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Payments will appear here once recorded
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>Date</span>
                            </div>
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <IndianRupee className="h-4 w-4 flex-shrink-0" />
                              <span>Amount Paid</span>
                            </div>
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <span>Payment Type</span>
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <IndianRupee className="h-4 w-4 flex-shrink-0" />
                              <span>Balance Due</span>
                            </div>
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {paymentHistory.data.map((entry, index) => (
                          <tr
                            key={entry._id}
                            className={`transition-colors hover:bg-blue-50/50 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                            }`}
                          >
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {formatDate(entry.date)}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-emerald-100 text-emerald-800">
                                {formatCurrency(entry.amount)}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                                  entry.paymentType === "CREDIT"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {entry.paymentType === "CREDIT"
                                  ? "Payment Received"
                                  : "Payment Added"}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                                  entry.amount_left > 0
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {formatCurrency(entry.amount_left)}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="max-w-xs sm:max-w-md">
                                {entry.remarks ? (
                                  <span className="text-xs sm:text-sm text-gray-700 break-words">
                                    {entry.remarks}
                                  </span>
                                ) : (
                                  <span className="text-xs sm:text-sm text-gray-400 italic">
                                    No remarks
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialsDialog;
