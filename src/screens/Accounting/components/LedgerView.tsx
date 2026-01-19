import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { accountingApi } from '@/lib/api/accounting';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '../constants';

interface Ledger {
  _id: string;
  name: string;
  type: string;
  subType: string;
  category: string;
  openingBalance?: number;
  closingBalance?: number;
  balance?: number;
}

interface Voucher {
  _id: string;
  type: string;
  voucherNumber: number;
  date: string;
  debitLedger: string | { _id: string; name: string };
  creditLedger: string | { _id: string; name: string };
  amount: number;
  narration?: string;
}

// Helper function to get ledger name by ID
const getLedgerName = (
  ledgerId: string | { _id: string; name: string },
  ledgers: Ledger[]
): string => {
  if (typeof ledgerId === 'string') {
    const found = ledgers.find((l) => l._id === ledgerId);
    return found?.name || '';
  }
  return ledgerId.name;
};

// Helper function to get ledger entries
const getLedgerEntries = (
  selectedLedgerId: string | null,
  ledgers: Ledger[],
  vouchers: Voucher[]
) => {
  if (!selectedLedgerId) {
    return { debitEntries: [], creditEntries: [], ledger: null };
  }

  const ledger = ledgers.find((l) => l._id === selectedLedgerId);
  if (!ledger) {
    return { debitEntries: [], creditEntries: [], ledger: null };
  }

  const debitEntries: Array<{
    date: string;
    amount: number;
    narration?: string;
    debitLedger: string | { _id: string; name: string };
    creditLedger: string | { _id: string; name: string };
  }> = [];
  const creditEntries: Array<{
    date: string;
    amount: number;
    narration?: string;
    debitLedger: string | { _id: string; name: string };
    creditLedger: string | { _id: string; name: string };
  }> = [];

  vouchers.forEach((voucher) => {
    const debitId = typeof voucher.debitLedger === 'string' ? voucher.debitLedger : voucher.debitLedger._id;
    const creditId = typeof voucher.creditLedger === 'string' ? voucher.creditLedger : voucher.creditLedger._id;

    if (debitId === selectedLedgerId) {
      debitEntries.push({
        date: voucher.date,
        amount: voucher.amount,
        narration: voucher.narration,
        debitLedger: voucher.debitLedger,
        creditLedger: voucher.creditLedger,
      });
    }
    if (creditId === selectedLedgerId) {
      creditEntries.push({
        date: voucher.date,
        amount: voucher.amount,
        narration: voucher.narration,
        debitLedger: voucher.debitLedger,
        creditLedger: voucher.creditLedger,
      });
    }
  });

  return { debitEntries, creditEntries, ledger };
};

interface DateRange {
  from: string | null;
  to: string | null;
}

interface LedgerViewProps {
  dateRange?: DateRange;
}

const LedgerView = ({ dateRange }: LedgerViewProps) => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>('');

  const { data: ledgersData } = useQuery({
    queryKey: ['ledgers', dateRange?.from, dateRange?.to],
    queryFn: () => {
      const params: { from?: string; to?: string } = {};
      if (dateRange?.from) {
        params.from = dateRange.from;
      }
      if (dateRange?.to) {
        params.to = dateRange.to;
      }
      return accountingApi.getLedgers(params, adminInfo?.token || '');
    },
    enabled: !!adminInfo?.token
  });

  const { data: vouchersData } = useQuery({
    queryKey: ['vouchers', dateRange?.from, dateRange?.to],
    queryFn: () => {
      const params: { from?: string; to?: string } = {};
      if (dateRange?.from) {
        params.from = dateRange.from;
      }
      if (dateRange?.to) {
        params.to = dateRange.to;
      }
      return accountingApi.getVouchers(params, adminInfo?.token || '');
    },
    enabled: !!adminInfo?.token
  });

  useEffect(() => {
    const handleViewLedger = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const ledgerId = customEvent.detail;
      if (ledgerId && typeof ledgerId === 'string') {
        setSelectedLedgerId(ledgerId);
      }
    };

    // Listen for the viewLedger event
    window.addEventListener('viewLedger', handleViewLedger);

    return () => {
      window.removeEventListener('viewLedger', handleViewLedger);
    };
  }, []);

  const ledgers: Ledger[] = ledgersData?.data || [];
  const vouchers: Voucher[] = vouchersData?.data || [];

  const { debitEntries, creditEntries, ledger } = getLedgerEntries(
    selectedLedgerId || null,
    ledgers,
    vouchers
  );

  if (!selectedLedgerId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Select Ledger to View</h2>
        <Select value={selectedLedgerId} onValueChange={setSelectedLedgerId}>
          <SelectTrigger className="w-full md:w-1/2">
            <SelectValue placeholder="Select a Ledger" />
          </SelectTrigger>
          <SelectContent>
            {ledgers.map((ledger) => (
              <SelectItem key={ledger._id} value={ledger._id}>
                {ledger.name} ({ledger.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (!ledger) return null;

  // For Stock in Hand, use closing balance if available
  const balance = ledger.name === "Stock in Hand" && ledger.category === "Stock in Hand" && ledger.closingBalance !== undefined
    ? ledger.closingBalance
    : (ledger.balance || ledger.closingBalance || 0);
  const isDebitBalance = ["Asset", "Expense"].includes(ledger.type)
    ? balance >= 0
    : balance < 0;

  // Combine all entries and sort by date
  const allEntries = [
    ...debitEntries.map((e) => ({ ...e, isDebit: true, type: "D" })),
    ...creditEntries.map((e) => ({ ...e, isDebit: false, type: "C" })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate running balance
  let runningBalance = ledger.openingBalance || 0;
  const entriesWithBalance = allEntries.map((entry) => {
    if (entry.isDebit) {
      if (["Asset", "Expense"].includes(ledger.type)) {
        runningBalance += entry.amount;
      } else {
        runningBalance -= entry.amount;
      }
    } else {
      if (["Liability", "Income", "Equity"].includes(ledger.type)) {
        runningBalance += entry.amount;
      } else {
        runningBalance -= entry.amount;
      }
    }
    return { ...entry, runningBalance };
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Select Ledger to View</h2>
        <Select value={selectedLedgerId} onValueChange={setSelectedLedgerId}>
          <SelectTrigger className="w-full md:w-1/2">
            <SelectValue placeholder="Select a Ledger" />
          </SelectTrigger>
          <SelectContent>
            {ledgers.map((l) => (
              <SelectItem key={l._id} value={l._id}>
                {l.name} ({l.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        {/* Header */}
        <div className="bg-blue-800 text-white p-4 mb-4 rounded-t">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Statement of Account</h2>
              <h3 className="text-lg font-semibold mt-1">{ledger.name}</h3>
            </div>
            <div className="text-right">
              <div className="text-sm">
                Period: {new Date().toLocaleDateString("en-GB")}
              </div>
            </div>
          </div>
        </div>

        {/* Account Summary Bar */}
        <div className="bg-red-600 text-white p-3 mb-4 rounded flex justify-between items-center">
          <div className="font-semibold">
            {ledger.name} [{ledger.type}]
          </div>
          <div className="font-bold text-lg">
            {Math.abs(balance).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {isDebitBalance ? "Dr" : "Cr"}
          </div>
        </div>

        {/* Account Details */}
        <div className="border rounded">
          <div className="bg-gray-100 p-2 border-b">
            <h4 className="font-semibold underline">A/c: {ledger.name}</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left border">Date</th>
                  <th className="px-4 py-2 text-center border">B</th>
                  <th className="px-4 py-2 text-left border">Narration</th>
                  <th className="px-4 py-2 text-right border">Debit</th>
                  <th className="px-4 py-2 text-right border">Credit</th>
                  <th className="px-4 py-2 text-right border">Balance</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening Balance */}
                {(ledger.openingBalance ?? 0) !== 0 && (
                  <tr className="border-b hover:bg-blue-50">
                    <td className="px-4 py-2 border">
                      {formatDate(new Date().toISOString().split("T")[0])}
                    </td>
                    <td className="px-4 py-2 text-center border">OB</td>
                    <td className="px-4 py-2 border">Opening Balance</td>
                    <td className="px-4 py-2 text-right border">
                      {(ledger.openingBalance ?? 0) > 0 &&
                      ["Asset", "Expense"].includes(ledger.type)
                        ? (ledger.openingBalance ?? 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : ""}
                    </td>
                    <td className="px-4 py-2 text-right border">
                      {(ledger.openingBalance ?? 0) > 0 &&
                      ["Liability", "Income", "Equity"].includes(ledger.type)
                        ? (ledger.openingBalance ?? 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : (ledger.openingBalance ?? 0) < 0 &&
                          ["Asset", "Expense"].includes(ledger.type)
                        ? Math.abs(ledger.openingBalance ?? 0).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )
                        : ""}
                    </td>
                    <td className="px-4 py-2 text-right border font-medium">
                      {Math.abs(ledger.openingBalance ?? 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {(ledger.openingBalance ?? 0) >= 0 ? "Dr" : "Cr"}
                    </td>
                  </tr>
                )}

                {/* Transaction Entries */}
                {entriesWithBalance.map((entry, idx) => {
                  const entryBalance = entry.runningBalance;
                  const entryIsDebit = ["Asset", "Expense"].includes(ledger.type)
                    ? entryBalance >= 0
                    : entryBalance < 0;
                  return (
                    <tr key={idx} className="border-b hover:bg-blue-50">
                      <td className="px-4 py-2 border">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-4 py-2 text-center border">
                        {entry.type}
                      </td>
                      <td className="px-4 py-2 border">
                        {entry.narration ||
                          `${entry.isDebit ? "To" : "By"} ${getLedgerName(
                            entry.isDebit
                              ? entry.creditLedger
                              : entry.debitLedger,
                            ledgers
                          )}`}
                      </td>
                      <td className="px-4 py-2 text-right border">
                        {entry.isDebit
                          ? entry.amount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : ""}
                      </td>
                      <td className="px-4 py-2 text-right border">
                        {!entry.isDebit
                          ? entry.amount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : ""}
                      </td>
                      <td className="px-4 py-2 text-right border font-medium">
                        {Math.abs(entryBalance).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {entryIsDebit ? "Dr" : "Cr"}
                      </td>
                    </tr>
                  );
                })}

                {allEntries.length === 0 && (ledger.openingBalance ?? 0) === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500 border"
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Closing Balance Summary */}
        <div className="mt-4 p-4 bg-blue-50 rounded border">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Closing Balance:</span>
            <span className="font-bold text-xl text-blue-800">
              ₹ {Math.abs(balance).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {isDebitBalance ? "Dr" : "Cr"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerView;
