import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
// DailySummaryPDF will be dynamically imported when needed
import { storeAdminApi } from "@/lib/api/storeAdmin";
import { StoreAdmin } from "@/utils/types";
import { Calendar, FileText } from "lucide-react";

interface GetReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GetReportsDialog = ({ open, onOpenChange }: GetReportsDialogProps) => {
  const today = new Date();
  const [startDate, setStartDate] = useState<Date | undefined>(today);
  const [endDate, setEndDate] = useState<Date | undefined>(today);
  const [reportData, setReportData] = useState<unknown | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [groupByFarmers, setGroupByFarmers] = useState(false);
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  // Format date to DD.MM.YY format (2 digit year)
  const formatDateForAPI = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}.${month}.${year}`;
  };

  // Query for daily summary
  const [dailySummaryParams, setDailySummaryParams] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  const {
    data: dailySummaryData,
    isLoading: isDailySummaryLoading,
    error: dailySummaryError,
  } = useQuery({
    queryKey: ["dailySummary", dailySummaryParams],
    queryFn: () =>
      storeAdminApi.getOrdersDailySummary(
        dailySummaryParams!,
        adminInfo?.token || ""
      ),
    enabled:
      !!dailySummaryParams &&
      !!adminInfo?.token &&
      !!dailySummaryParams.startDate &&
      !!dailySummaryParams.endDate,
  });

  // Update report data when query succeeds
  useEffect(() => {
    if (dailySummaryData) {
      setReportData(dailySummaryData);
    }
  }, [dailySummaryData]);

  const handleGetReports = () => {
    if (!startDate || !endDate) {
      return;
    }
    const formattedStartDate = formatDateForAPI(startDate);
    const formattedEndDate = formatDateForAPI(endDate);
    setDailySummaryParams({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });
  };

  const handleCloseModal = () => {
    onOpenChange(false);
    setReportData(null);
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setDailySummaryParams(null);
    setGroupByFarmers(false);
  };

  const handleGeneratePDF = async () => {
    if (!adminInfo || !reportData || !startDate || !endDate) {
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      // Dynamically import PDF library and component only when needed
      const [{ pdf }, { default: DailySummaryPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/DailySummaryPDF")
      ]);

      const pdfComponent = (
        <DailySummaryPDF
          adminInfo={adminInfo as unknown as StoreAdmin}
          summaryData={reportData}
          startDate={formattedStartDate}
          endDate={formattedEndDate}
          groupByFarmers={groupByFarmers}
        />
      );

      const pdfBlob = await pdf(pdfComponent).toBlob();

      const enhancedBlob = new Blob([pdfBlob], {
        type: "application/pdf",
      });

      const pdfUrl = URL.createObjectURL(enhancedBlob);
      const fileName = `Daily_Summary_${formattedStartDate}_${formattedEndDate}.pdf`;

      const newWindow = window.open(pdfUrl, "_blank");

      if (newWindow) {
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 5000);
      } else {
        const downloadLink = document.createElement("a");
        downloadLink.href = pdfUrl;
        downloadLink.download = fileName;
        downloadLink.style.display = "none";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        alert("Popup was blocked. PDF has been downloaded instead.");

        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          handleCloseModal();
        } else {
          onOpenChange(true);
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Daily Summary Report
          </DialogTitle>
          <DialogDescription className="text-base">
            Generate comprehensive daily reports for your selected date range
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <SimpleDatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="DD.MM.YYYY"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                End Date
              </label>
              <SimpleDatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="DD.MM.YYYY"
              />
            </div>
          </div>

          {/* Group By Farmers Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="group-by-farmers"
              checked={groupByFarmers}
              onCheckedChange={(checked) => setGroupByFarmers(checked === true)}
            />
            <Label
              htmlFor="group-by-farmers"
              className="text-sm font-medium cursor-pointer"
            >
              Group by farmers
            </Label>
          </div>

          {/* Error Message */}
          {dailySummaryError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                {dailySummaryError instanceof Error
                  ? dailySummaryError.message
                  : "Failed to fetch report. Please try again."}
              </p>
            </div>
          )}

          {/* Report Data Display */}
          {reportData !== null && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">
                    Report Ready
                  </h3>
                  <p className="text-sm text-green-700">
                    Your daily summary report has been generated successfully.
                    Click the button below to view or download the PDF.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {reportData !== null ? (
              <>
                <Button
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF || !adminInfo}
                  className="flex-1 h-11"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      View PDF
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1 h-11"
                >
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleGetReports}
                  disabled={!startDate || !endDate || isDailySummaryLoading}
                  className="flex-1 h-11"
                >
                  {isDailySummaryLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="sm:w-auto w-full h-11"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GetReportsDialog;
