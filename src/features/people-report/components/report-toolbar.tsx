import type { GroupingState, Table } from '@tanstack/react-table';
import { Eye, FileSpreadsheet, Loader2, RefreshCw, Search } from 'lucide-react';

import { DatePickerInput } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateParam, parseDateParam } from '@/features/people/search';
import { Separator } from '@/components/ui/separator';
import { FarmerStockLedgerPdfButton } from '@/features/people-report/components/farmer-stock-ledger-pdf-button';
import type { FarmerReportTableRow } from '@/features/people-report/utils/build-farmer-report-sections';
import type { BuildFarmerStockLedgerPdfDataInput } from '@/features/people-report/utils/build-farmer-stock-ledger-pdf-data';
import {
  FARMER_REPORT_GROUP_COLUMN_IDS,
  isFarmerReportGrouped,
  type FarmerReportGroupColumnId,
} from '@/features/people-report/utils/report-grouping';
import { cn } from '@/lib/utils';

import { ViewFiltersSheet } from './view-filters';

export interface ReportToolbarProps {
  table: Table<FarmerReportTableRow> | null;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  grouping: GroupingState;
  showStockFilterGrouping: boolean;
  onToggleGrouping: (columnId: FarmerReportGroupColumnId) => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  isExporting?: boolean;
  onPreview?: () => void;
  onExportExcel?: () => void;
  getPdfBuildInput: () => BuildFarmerStockLedgerPdfDataInput | null;
  pdfDisabled?: boolean;
  previewDisabled?: boolean;
  excelDisabled?: boolean;
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
  grouping,
  showStockFilterGrouping,
  onToggleGrouping,
  isLoading = false,
  isRefreshing = false,
  isExporting = false,
  onPreview,
  onExportExcel,
  getPdfBuildInput,
  pdfDisabled = false,
  previewDisabled = false,
  excelDisabled = false,
  showViewFilters = false,
  className,
}: ReportToolbarProps) {
  const isVarietyGrouped = isFarmerReportGrouped(grouping, FARMER_REPORT_GROUP_COLUMN_IDS.variety);
  const isStockFilterGrouped = isFarmerReportGrouped(
    grouping,
    FARMER_REPORT_GROUP_COLUMN_IDS.stockFilter,
  );

  return (
    <div className={cn('border-border/60 border-t', className)}>
      <div className="overflow-x-auto px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
          <div
            className={cn(
              'flex min-w-min flex-col gap-3 sm:gap-4',
              'lg:min-w-0 lg:flex-row lg:flex-nowrap lg:items-end lg:gap-3',
            )}
          >
            <div className="flex min-w-0 shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3 lg:gap-3">
              <DatePickerInput
                id="farmer-report-from"
                label="From"
                value={parseDateParam(dateFrom)}
                onChange={(date) => onDateFromChange(date ? formatDateParam(date) : '')}
                disabled={isRefreshing}
                className="min-w-0 sm:w-[180px]"
              />

              <DatePickerInput
                id="farmer-report-to"
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
                placeholder="Search stock ledger..."
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                disabled={isLoading}
                className="w-full pl-9"
                aria-label="Search stock ledger"
              />
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {showViewFilters && table ? <ViewFiltersSheet table={table} /> : null}

              <FarmerStockLedgerPdfButton
                getPdfBuildInput={getPdfBuildInput}
                disabled={pdfDisabled}
                variant="outline"
              />

              <Button
                type="button"
                variant="outline"
                className="min-w-0 gap-1.5 lg:flex-none"
                aria-label="Preview farmer stock ledger"
                onClick={() => void onPreview?.()}
                disabled={isLoading || previewDisabled}
              >
                <Eye className="size-4 shrink-0" aria-hidden />
                <span className="truncate">Preview</span>
              </Button>

              <Button
                type="button"
                className="min-w-0 gap-1.5 lg:flex-none"
                aria-label="Export farmer stock ledger to Excel"
                onClick={() => void onExportExcel?.()}
                disabled={isLoading || isExporting || excelDisabled}
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
                aria-label="Refresh farmer stock ledger"
                disabled={isRefreshing}
                onClick={onRefresh}
              >
                <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} aria-hidden />
              </Button>
            </div>
          </div>

          <Separator className="bg-border/60" />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={isVarietyGrouped ? 'secondary' : 'outline'}
              className={cn('min-w-0', isVarietyGrouped && 'ring-border ring-1')}
              disabled={isLoading}
              onClick={() => onToggleGrouping(FARMER_REPORT_GROUP_COLUMN_IDS.variety)}
              aria-pressed={isVarietyGrouped}
            >
              {isVarietyGrouped ? 'Ungroup Variety' : 'Group by Variety'}
            </Button>
            {showStockFilterGrouping ? (
              <Button
                type="button"
                size="sm"
                variant={isStockFilterGrouped ? 'secondary' : 'outline'}
                className={cn('min-w-0', isStockFilterGrouped && 'ring-border ring-1')}
                disabled={isLoading}
                onClick={() => onToggleGrouping(FARMER_REPORT_GROUP_COLUMN_IDS.stockFilter)}
                aria-pressed={isStockFilterGrouped}
              >
                {isStockFilterGrouped ? 'Ungroup Stock Filter' : 'Group by Stock Filter'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
