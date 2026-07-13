import { isSalesIncome, isStockLedger, isTradingPurchase } from './ledger-classification';
import type { NetProfitLossResult, ReportLedger } from './types';

export function computeNetProfitLoss(
  ledgers: ReportLedger[],
  balanceMap: Map<string, number>,
): NetProfitLossResult {
  const getBalance = (ledger: ReportLedger) => balanceMap.get(ledger.id) ?? 0;

  const stockInHand = ledgers.find(isStockLedger);
  const openingStock = stockInHand?.openingBalance ?? 0;
  const closingStock = stockInHand != null ? getBalance(stockInHand) : 0;

  const incomeLedgers = ledgers.filter((ledger) => ledger.type === 'Income');
  const expenseLedgers = ledgers.filter((ledger) => ledger.type === 'Expense');

  const sales = incomeLedgers.filter(isSalesIncome);
  const otherIncome = incomeLedgers.filter((ledger) => !isSalesIncome(ledger));

  const tradingExpenses = expenseLedgers.filter(isTradingPurchase);
  const nonTradingExpenses = expenseLedgers.filter((ledger) => !isTradingPurchase(ledger));

  const salesTotal = sales.reduce((sum, ledger) => sum + getBalance(ledger), 0);
  const purchaseTotal = tradingExpenses.reduce((sum, ledger) => sum + getBalance(ledger), 0);

  const grossProfit = salesTotal + closingStock - purchaseTotal - openingStock;

  const indirectIncomesTotal = otherIncome.reduce((sum, ledger) => sum + getBalance(ledger), 0);
  const indirectExpensesTotal = nonTradingExpenses.reduce(
    (sum, ledger) => sum + getBalance(ledger),
    0,
  );
  const netProfitLoss = grossProfit + indirectIncomesTotal - indirectExpensesTotal;

  return {
    openingStock,
    closingStock,
    salesTotal,
    purchaseTotal,
    grossProfit,
    indirectIncomesTotal,
    indirectExpensesTotal,
    netProfitLoss,
  };
}
