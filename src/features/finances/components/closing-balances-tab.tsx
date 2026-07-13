import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LedgerType } from '@/features/finances/types';
import { useClosingBalances } from '@/features/finances/hooks/use-closing-balances';
import { useFinancesReportPeriod } from '@/features/finances/hooks/finances-report-context';

import { BalanceSheetSummary } from './reports/balance-sheet-summary';
import { ReportStateCard } from './reports/report-state-card';
import { TypeSectionTable } from './reports/type-section-table';

const TYPE_ORDER: LedgerType[] = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];

const ClosingBalanceTab = () => {
  const period = useFinancesReportPeriod();
  const { report, isLoading, isError, error } = useClosingBalances(period);

  if (isLoading) {
    return <ReportStateCard variant="loading" message="Loading closing balances…" />;
  }

  if (isError) {
    return (
      <ReportStateCard
        variant="error"
        message={error instanceof Error ? error.message : 'Failed to load closing balances'}
      />
    );
  }

  if (!report) {
    return (
      <ReportStateCard
        variant="empty"
        title="No data available"
        message="Add ledgers and vouchers to view closing balances."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-border border-b pb-4">
          <CardTitle className="font-heading text-xl font-semibold tracking-tight">
            Closing Balances Report
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Closing balances of all ledgers that form the basis of financial statements.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 p-4 sm:p-6">
          {TYPE_ORDER.filter((type) => report.groupedByType[type]?.length).map((type) => {
            const groups = report.groupedByType[type]!;
            const typeTotal = groups.reduce((sum, group) => sum + group.total, 0);
            const displayTotal = type === 'Equity' ? typeTotal + report.netProfitLoss : typeTotal;

            return (
              <TypeSectionTable
                key={type}
                type={type}
                groups={groups}
                displayTotal={displayTotal}
                netProfitLoss={type === 'Equity' ? report.netProfitLoss : undefined}
              />
            );
          })}
        </CardContent>
      </Card>

      <BalanceSheetSummary
        totalAssets={report.totalAssets}
        totalLiabilitiesAndEquity={report.totalLiabilitiesAndEquity}
        isBalanced={report.isBalanced}
      />
    </div>
  );
};

export default ClosingBalanceTab;
