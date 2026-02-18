import { useState, useRef, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

import { DatePicker } from '@/components/forms/date-picker';
import { useGetReports, type GetReportsParams } from '@/services/analytics/useGetReports';
import { formatDate, formatDateToISO } from '@/lib/helpers';
import { useStore } from '@/stores/store';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

export interface GetReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional legacy callback; dialog now fetches and shows View PDF internally */
  onSubmit?: (fromDate: string, toDate: string, groupByFarmers: boolean) => void;
}

function formatDateRangeLabel(from: string, to: string): string {
  if (!from || !to) return '';
  const formatPart = (s: string) => {
    const [y, m, d] = s.split('-');
    return `${d ?? ''}/${m ?? ''}/${String(y ?? '').slice(2)}`;
  };
  return `${formatPart(from)} – ${formatPart(to)}`;
}

export function GetReportsDialog({
  open,
  onOpenChange,
  onSubmit,
}: GetReportsDialogProps) {
  const [fromDate, setFromDate] = useState(() => formatDate(new Date()));
  const [toDate, setToDate] = useState(() => formatDate(new Date()));
  const [groupByFarmers, setGroupByFarmers] = useState(false);
  const [reportParams, setReportParams] = useState<GetReportsParams | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const userTriggeredFetchRef = useRef(false);

  const coldStorage = useStore((s) => s.coldStorage);
  const sizeColumns = useStore((s) => s.preferences?.commodities?.[0]?.sizes ?? []);

  const reportQuery = useGetReports(reportParams, { enabled: !!reportParams });

  useEffect(() => {
    if (!userTriggeredFetchRef.current) return;
    if (reportQuery.isSuccess && reportQuery.data) {
      toast.success('Reports refreshed', {
        id: 'get-reports',
        description: 'Report data is ready. You can view the PDF.',
      });
      userTriggeredFetchRef.current = false;
    }
    if (reportQuery.isError) {
      toast.dismiss('get-reports');
      userTriggeredFetchRef.current = false;
    }
  }, [reportQuery.isSuccess, reportQuery.isError, reportQuery.data]);

  const handleGetReports = () => {
    const from = fromDate.trim() ? formatDateToISO(fromDate).split('T')[0] ?? '' : '';
    const to = toDate.trim() ? formatDateToISO(toDate).split('T')[0] ?? '' : '';
    if (!from || !to) {
      toast.error('Please select both From and To dates.');
      return;
    }
    const newParams = { from, to, groupByFarmers };
    const sameParams =
      reportParams?.from === from &&
      reportParams?.to === to &&
      reportParams?.groupByFarmers === groupByFarmers;
    userTriggeredFetchRef.current = true;
    toast.loading('Fetching reports…', { id: 'get-reports' });
    setReportParams(newParams);
    // If user re-clicks with same options, force a fresh fetch (cache is disabled for this query)
    if (sameParams) {
      void reportQuery.refetch();
    }
    onSubmit?.(fromDate, toDate, groupByFarmers);
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setGroupByFarmers(false);
    setReportParams(null);
  };

  const handleViewPdf = async () => {
    const data = reportQuery.data;
    if (!data) return;
    const companyName = coldStorage?.name ?? 'Cold Storage';
    const dateRangeLabel = formatDateRangeLabel(data.from, data.to);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(
        '<html><body style="font-family:sans-serif;padding:2rem;text-align:center;color:#666;">Generating PDF…</body></html>'
      );
    }
    setIsGeneratingPdf(true);
    try {
      const [{ pdf }, { DailyReportPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/pdf/DailyReportPdf'),
      ]);
      const blob = await pdf(
        <DailyReportPdf
          companyName={companyName}
          dateRangeLabel={dateRangeLabel}
          data={data}
          sizeColumns={sizeColumns.length > 0 ? sizeColumns : ['Ration', 'Goli', 'Cut-tok']}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      if (printWindow) {
        printWindow.location.href = url;
      } else {
        window.location.href = url;
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      toast.success('PDF opened in new tab', {
        duration: 3000,
        description: 'Daily report is ready to view or print.',
      });
    } catch {
      if (printWindow) printWindow.close();
      toast.error('Could not generate PDF', {
        description: 'Please try again.',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const reportReady = reportQuery.isSuccess && reportQuery.data != null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-custom sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get Reports</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <DatePicker
            id="reports-from-date"
            label="From"
            value={fromDate}
            onChange={setFromDate}
            fullWidth
          />
          <DatePicker
            id="reports-to-date"
            label="To"
            value={toDate}
            onChange={setToDate}
            fullWidth
          />
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="reports-group-by-farmers"
              checked={groupByFarmers}
              onCheckedChange={(checked) =>
                setGroupByFarmers(checked === true)
              }
            />
            <Label
              htmlFor="reports-group-by-farmers"
              className="cursor-pointer text-sm font-normal"
            >
              Group by farmers
            </Label>
          </div>

          {reportQuery.isLoading && (
            <p className="text-muted-foreground text-sm">Loading report…</p>
          )}
          {reportQuery.isError && (
            <p className="text-destructive text-sm">
              {reportQuery.error instanceof Error
                ? reportQuery.error.message
                : 'Failed to load report'}
            </p>
          )}
        </div>
        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-4">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
          <Button
            onClick={handleGetReports}
            disabled={reportQuery.isLoading}
            className="w-full sm:w-auto"
          >
            Get Reports
          </Button>
          {reportReady && (
            <Button
              onClick={handleViewPdf}
              disabled={isGeneratingPdf}
              className="w-full gap-2 sm:w-auto"
            >
              <FileText className="h-4 w-4" />
              {isGeneratingPdf ? 'Generating…' : 'View PDF'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
