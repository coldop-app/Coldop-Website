import type { Table } from '@tanstack/react-table';
import { Eye, FileSpreadsheet, Loader2, RefreshCw, Search } from 'lucide-react';

import { DatePickerInput } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateParam, parseDateParam } from '@/features/people/search';
import type { OutgoingGatePassReportRecord } from '@/features/outgoing-report/api/types';
import { GatePassReportPdfButton } from '@/lib/gate-pass-report-pdf/gate-pass-report-pdf-button';
import type { GatePassReportPdfData } from '@/lib/gate-pass-report-pdf/types';
import { cn } from '@/lib/utils';

import { ViewFiltersSheet } from './view-filters';

export interface ReportToolbarProps {
  table: Table<OutgoingGatePassReportRecord> | null;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  isExporting?: boolean;
  onPreview?: () => void;
  onExportExcel?: () => void;
  getPdfData: () => GatePassReportPdfData | null;
  pdfDisabled?: boolean;
  showViewFilters?: boolean;
  className?: string;
}

export function ReportToolbar({
  table,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApply,
  onReset,
  onRefresh,
  searchQuery,
  onSearchChange,
  isLoading = false,
  isRefreshing = false,
  isExporting = false,
  onPreview,
  onExportExcel,
  getPdfData,
  pdfDisabled = false,
  showViewFilters = false,
  className,
}: ReportToolbarProps) {
  return (
    <div className={cn('overflow-x-auto px-4 py-3 sm:px-6 sm:py-4', className)}>
      <div
        className={cn(
          'flex min-w-min flex-col gap-3 sm:gap-4',
          'lg:min-w-0 lg:flex-row lg:flex-nowrap lg:items-end lg:gap-3',
        )}
      >
        <div className="flex min-w-0 shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3 lg:gap-3">
          <DatePickerInput
            id="outgoing-report-from"
            label="From"
            value={parseDateParam(dateFrom)}
            onChange={(date) => onDateFromChange(date ? formatDateParam(date) : '')}
            disabled={isRefreshing}
            className="min-w-0 sm:w-[180px]"
          />

          <DatePickerInput
            id="outgoing-report-to"
            label="To"
            value={parseDateParam(dateTo)}
            onChange={(date) => onDateToChange(date ? formatDateParam(date) : '')}
            disabled={isRefreshing}
            className="min-w-0 sm:w-[180px]"
          />

          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
            <Button type="button" className="min-w-0" disabled={isRefreshing} onClick={onApply}>
              Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-w-0"
              disabled={isRefreshing}
              onClick={onReset}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="relative min-w-0 lg:min-w-44 lg:flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search outgoing report..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            disabled={isLoading}
            className="w-full pl-9"
            aria-label="Search outgoing report"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showViewFilters && table ? <ViewFiltersSheet table={table} /> : null}

          <GatePassReportPdfButton
            getPdfData={getPdfData}
            disabled={pdfDisabled}
            variant="outline"
          />

          <Button
            type="button"
            variant="outline"
            className="min-w-0 gap-1.5 lg:flex-none"
            aria-label="Preview outgoing report"
            onClick={onPreview}
            disabled={isLoading || !table}
          >
            <Eye className="size-4 shrink-0" aria-hidden />
            <span className="truncate">Preview</span>
          </Button>

          <Button
            type="button"
            className="min-w-0 gap-1.5 lg:flex-none"
            aria-label="Export outgoing report to Excel"
            onClick={onExportExcel}
            disabled={isLoading || isExporting || !table}
          >
            {isExporting ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <FileSpreadsheet className="size-4 shrink-0" aria-hidden />
            )}
            <span className="truncate">{isExporting ? 'Exporting…' : 'Excel'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Refresh outgoing report"
            disabled={isRefreshing}
            onClick={onRefresh}
          >
            <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
