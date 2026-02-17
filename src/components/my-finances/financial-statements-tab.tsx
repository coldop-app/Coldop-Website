import { memo, useMemo } from 'react';

import { useGetAllLedgers } from '@/services/accounting/ledgers/useGetAllLedgers';

import BalanceSheet from './balance-sheet';
import TradingAndPLAccount from './tradingAndPLAccount';

const FinancialStatementsTab = memo(function FinancialStatementsTab() {
  const params = useMemo(() => ({}), []);

  const {
    data: ledgers = [],
    isLoading: ledgersLoading,
    isError: ledgersError,
    error: ledgersErr,
  } = useGetAllLedgers(params);

  return (
    <div className="space-y-6">
      <BalanceSheet />
      <TradingAndPLAccount
        ledgers={ledgers}
        isLoading={ledgersLoading}
        error={
          ledgersError
            ? (ledgersErr ?? new Error('Failed to load ledgers'))
            : null
        }
      />
    </div>
  );
});

export default FinancialStatementsTab;
