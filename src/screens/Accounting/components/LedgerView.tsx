import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '../constants';

interface LedgerEntry {
  _id: string;
  type: string;
  voucherNumber: number;
  date: string;
  debitLedger: { _id: string; name: string };
  creditLedger: { _id: string; name: string };
  amount: number;
  narration: string;
  entryType: 'Debit' | 'Credit';
  runningBalance: number;
}

const LedgerView = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>('');

  const { data: ledgersData } = useQuery({
    queryKey: ['ledgers'],
    queryFn: () => storeAdminApi.getLedgers({}, adminInfo?.token || ''),
    enabled: !!adminInfo?.token
  });

  const { data: entriesData, isLoading } = useQuery({
    queryKey: ['ledgerEntries', selectedLedgerId],
    queryFn: () => storeAdminApi.getLedgerEntries(selectedLedgerId, adminInfo?.token || ''),
    enabled: !!selectedLedgerId && !!adminInfo?.token
  });

  useEffect(() => {
    const handleViewLedger = (event: CustomEvent) => {
      setSelectedLedgerId(event.detail);
    };
    window.addEventListener('viewLedger' as any, handleViewLedger as EventListener);
    return () => {
      window.removeEventListener('viewLedger' as any, handleViewLedger as EventListener);
    };
  }, []);

  const ledgers = ledgersData?.data || [];
  const ledger = entriesData?.data?.ledger;
  const entries: LedgerEntry[] = entriesData?.data?.entries || [];

  const closingBalance = entries.length > 0
    ? entries[entries.length - 1].runningBalance
    : (ledger?.openingBalance || 0);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Select Ledger to View</h2>
        <Select value={selectedLedgerId} onValueChange={setSelectedLedgerId}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Select a ledger" />
          </SelectTrigger>
          <SelectContent>
            {ledgers.map((ledger: any) => (
              <SelectItem key={ledger._id} value={ledger._id}>
                {ledger.name} ({ledger.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {selectedLedgerId && ledger && (
        <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="bg-primary text-white rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold">Statement of Account</h3>
            <p className="text-sm opacity-90">{ledger.name}</p>
            <p className="text-xs opacity-75 mt-1">Period: {formatDate(new Date().toISOString())}</p>
          </div>

          <div className={`rounded-lg p-4 mb-4 ${
            ledger.type === 'Expense' || ledger.type === 'Asset'
              ? 'bg-red-50 border border-red-200'
              : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">{ledger.name} [{ledger.type}]</span>
              <span className="font-bold text-lg">
                {formatCurrency(closingBalance)} {ledger.type === 'Expense' || ledger.type === 'Asset' ? 'Dr' : 'Cr'}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">B</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Narration</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Debit</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Credit</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{formatDate(entry.date)}</td>
                      <td className="py-3 px-4 text-gray-600">{entry.type === 'Journal' ? 'D' : entry.type[0]}</td>
                      <td className="py-3 px-4 text-gray-900">{entry.narration}</td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {entry.entryType === 'Debit' ? formatCurrency(entry.amount) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {entry.entryType === 'Credit' ? formatCurrency(entry.amount) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(entry.runningBalance)} {entry.runningBalance >= 0 ? 'Dr' : 'Cr'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Closing Balance:</span>
              <span className="font-bold text-lg text-gray-900">
                {formatCurrency(Math.abs(closingBalance))} {closingBalance >= 0 ? 'Dr' : 'Cr'}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LedgerView;
