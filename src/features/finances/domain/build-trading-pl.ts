import { isSalesIncome, isTradingPurchase } from './ledger-classification';
import { computeLedgerBalances } from './compute-ledger-balances';
import { computeNetProfitLoss } from './compute-net-profit-loss';
import type { ReportLedger, ReportVoucher, TradingPlReport } from './types';

export function buildTradingPlReport(
  ledgers: ReportLedger[],
  vouchers: ReportVoucher[],
): TradingPlReport | null {
  if (ledgers.length === 0) {
    return null;
  }

  const balanceMap = computeLedgerBalances(ledgers, vouchers);
  const getBalance = (ledger: ReportLedger) => balanceMap.get(ledger.id) ?? 0;
  const pnl = computeNetProfitLoss(ledgers, balanceMap);

  const incomeLedgers = ledgers.filter((ledger) => ledger.type === 'Income');
  const expenseLedgers = ledgers.filter((ledger) => ledger.type === 'Expense');

  const incomeCategories: Array<{
    subType: string;
    category: string;
    total: number;
  }> = [];
  const expenseCategories: Array<{
    subType: string;
    category: string;
    total: number;
  }> = [];

  for (const ledger of incomeLedgers) {
    const balance = getBalance(ledger);
    const existing = incomeCategories.find(
      (item) => item.subType === ledger.subType && item.category === ledger.category,
    );
    if (existing) {
      existing.total += balance;
    } else {
      incomeCategories.push({
        subType: ledger.subType,
        category: ledger.category,
        total: balance,
      });
    }
  }

  for (const ledger of expenseLedgers) {
    const balance = getBalance(ledger);
    const existing = expenseCategories.find(
      (item) => item.subType === ledger.subType && item.category === ledger.category,
    );
    if (existing) {
      existing.total += balance;
    } else {
      expenseCategories.push({
        subType: ledger.subType,
        category: ledger.category,
        total: balance,
      });
    }
  }

  const otherIncome = incomeCategories.filter(
    (item) => !isSalesIncome({ type: 'Income', category: item.category }),
  );
  const nonTradingExpenses = expenseCategories.filter(
    (item) =>
      !isTradingPurchase({
        type: 'Expense',
        subType: item.subType,
        category: item.category,
      }),
  );

  const { grossProfit, netProfitLoss, openingStock, closingStock, purchaseTotal, salesTotal } = pnl;

  const pnlDebit = [
    ...(grossProfit < 0
      ? [
          {
            label: 'Gross Loss',
            amount: Math.abs(grossProfit),
            highlight: true,
            isProfit: false,
          },
        ]
      : []),
    ...nonTradingExpenses.map((item) => ({
      label: item.category,
      amount: item.total,
      highlight: false,
    })),
    ...(netProfitLoss > 0
      ? [
          {
            label: 'Net Profit Trfd. to Capital',
            amount: netProfitLoss,
            highlight: true,
            isProfit: true,
          },
        ]
      : []),
  ];

  const pnlCredit = [
    ...(grossProfit > 0
      ? [
          {
            label: 'Gross Profit',
            amount: grossProfit,
            highlight: true,
            isProfit: true,
          },
        ]
      : []),
    ...otherIncome.map((item) => ({
      label: item.category,
      amount: item.total,
      highlight: false,
    })),
    ...(netProfitLoss < 0
      ? [
          {
            label: 'Net Loss Trfd. to Capital',
            amount: Math.abs(netProfitLoss),
            highlight: true,
            isProfit: false,
          },
        ]
      : []),
  ];

  const tradingDebitTotal = openingStock + purchaseTotal + (grossProfit > 0 ? grossProfit : 0);
  const tradingCreditTotal =
    salesTotal + closingStock + (grossProfit < 0 ? Math.abs(grossProfit) : 0);
  const debitTotal = pnlDebit.reduce((sum, row) => sum + row.amount, 0);
  const creditTotal = pnlCredit.reduce((sum, row) => sum + row.amount, 0);

  return {
    openingStock,
    closingStock,
    purchaseTotal,
    salesTotal,
    grossProfit,
    netProfitLoss,
    pnlDebit,
    pnlCredit,
    tradingDebitTotal,
    tradingCreditTotal,
    debitTotal,
    creditTotal,
  };
}
