import { useMemo } from 'react';

import { useFinancesReportPeriod } from '@/features/finances/hooks/finances-report-context';
import { useFinancialSourceData } from '@/features/finances/hooks/use-financial-source-data';
import { useTradingPl } from '@/features/finances/hooks/use-trading-pl';
import { buildBalanceSheetReport } from '@/features/finances/domain/build-balance-sheet';

import { BalanceSheetView } from './reports/balance-sheet-view';
import { ReportStateCard } from './reports/report-state-card';
import { TradingPlView } from './reports/trading-pl-view';

const FinancialStatementTab = () => {
  const period = useFinancesReportPeriod();
  const { ledgers, vouchers, isLoading, isError, error } = useFinancialSourceData(period);
  const { report: tradingReport } = useTradingPl(ledgers, vouchers);

  const balanceSheetReport = useMemo(() => {
    if (ledgers.length === 0) {
      return null;
    }
    return buildBalanceSheetReport(ledgers, vouchers);
  }, [ledgers, vouchers]);

  if (isLoading) {
    return <ReportStateCard variant="loading" message="Loading financial statements…" />;
  }

  if (isError) {
    return (
      <ReportStateCard
        variant="error"
        message={error instanceof Error ? error.message : 'Failed to load financial statements'}
      />
    );
  }

  if (!balanceSheetReport || !tradingReport) {
    return (
      <ReportStateCard
        variant="empty"
        title="No data available"
        message="Add ledgers and vouchers to generate financial statements."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BalanceSheetView report={balanceSheetReport} />
      <TradingPlView report={tradingReport} />
    </div>
  );
};

export default FinancialStatementTab;
