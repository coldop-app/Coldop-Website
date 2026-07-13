import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LedgerStatementTable } from '@/features/finances/components/reports/ledger-statement-table';
import { ReportStateCard } from '@/features/finances/components/reports/report-state-card';
import { useLedgerStatement } from '@/features/finances/hooks/use-ledger-statement';
import { formatPeriodRangeLabel } from '@/features/finances/hooks/use-report-date-range';
import {
  buildLedgerStatementBackTarget,
  type LedgerStatementSearch,
} from '@/features/finances/search';
import { PERIOD_LABELS } from '@/features/finances/shared/constants';
import { formatCurrency } from '@/features/finances/shared/format-currency';

type LedgerStatementPageProps = {
  ledgerId: string;
  search: LedgerStatementSearch;
};

function LedgerStatementBackButton({
  search,
  farmerStorageLinkId,
}: {
  search: LedgerStatementSearch;
  farmerStorageLinkId?: string | null;
}) {
  const backTarget = buildLedgerStatementBackTarget(search, farmerStorageLinkId, search.period);

  return (
    <Button variant="outline" size="sm" className="w-fit" asChild>
      {backTarget.kind === 'people' ? (
        <Link to={backTarget.to} params={backTarget.params} search={backTarget.search}>
          <ArrowLeft className="size-4" />
          {backTarget.label}
        </Link>
      ) : (
        <Link to={backTarget.to} search={backTarget.search}>
          <ArrowLeft className="size-4" />
          {backTarget.label}
        </Link>
      )}
    </Button>
  );
}

export function LedgerStatementPage({ ledgerId, search }: LedgerStatementPageProps) {
  const { period } = search;
  const { report, isLoading, isError, error } = useLedgerStatement(ledgerId, period);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <LedgerStatementBackButton search={search} />
        <ReportStateCard variant="loading" message="Loading ledger statement…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        <LedgerStatementBackButton search={search} />
        <ReportStateCard
          variant="error"
          message={error instanceof Error ? error.message : 'Failed to load ledger statement'}
        />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col gap-4">
        <LedgerStatementBackButton search={search} />
        <ReportStateCard
          variant="empty"
          title="Ledger not found"
          message="The selected ledger could not be loaded."
        />
      </div>
    );
  }

  const periodLabel = `${PERIOD_LABELS[period]} (${formatPeriodRangeLabel(period)})`;

  return (
    <div className="flex flex-col gap-4">
      <LedgerStatementBackButton
        search={search}
        farmerStorageLinkId={report.ledger.farmerStorageLinkId}
      />

      <Card className="overflow-hidden">
        <CardHeader className="border-border bg-primary text-primary-foreground border-b px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-heading text-primary-foreground text-xl font-semibold">
                Statement of Account
              </CardTitle>
              <p className="mt-1 text-base font-medium">{report.ledger.name}</p>
            </div>
            <p className="text-sm opacity-90">Period: {periodLabel}</p>
          </div>
        </CardHeader>

        <div className="border-border bg-muted flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-6">
          <span className="text-sm font-medium">
            {report.ledger.name} [{report.ledger.type}]
          </span>
          <span className="text-base font-semibold tabular-nums">
            {formatCurrency(Math.abs(report.closingBalance))} {report.isDebitBalance ? 'Dr' : 'Cr'}
          </span>
        </div>

        <CardContent className="p-4 sm:p-6">
          <LedgerStatementTable statement={report} />
        </CardContent>

        <div className="border-border bg-muted/50 border-t px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-base font-semibold">Closing Balance:</span>
            <span className="text-primary text-xl font-semibold tabular-nums">
              {formatCurrency(Math.abs(report.closingBalance))}{' '}
              {report.isDebitBalance ? 'Dr' : 'Cr'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
