import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '../constants';
import { Search, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Ledger {
  _id: string;
  name: string;
  type: string;
  subType: string;
  category: string;
  balance: number;
}

const LedgerList = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['ledgers', { type: typeFilter !== 'all' ? typeFilter : undefined, search: searchQuery }],
    queryFn: () => storeAdminApi.getLedgers(
      {
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchQuery || undefined
      },
      adminInfo?.token || ''
    ),
    enabled: !!adminInfo?.token
  });

  const queryClient = useQueryClient();

  const deleteLedgerMutation = useMutation({
    mutationFn: (ledgerId: string) => storeAdminApi.deleteLedger(ledgerId, adminInfo?.token || ''),
    onSuccess: () => {
      toast.success('Ledger deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete ledger');
    }
  });

  const handleDelete = (ledgerId: string, ledgerName: string) => {
    if (window.confirm(`Are you sure you want to delete "${ledgerName}"?`)) {
      deleteLedgerMutation.mutate(ledgerId);
    }
  };

  const ledgers: Ledger[] = data?.data || [];

  return (
    <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Ledger List</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search ledgers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Asset">Asset</SelectItem>
              <SelectItem value="Liability">Liability</SelectItem>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
              <SelectItem value="Equity">Equity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading ledgers...</div>
      ) : ledgers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No ledgers found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ledger Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sub-Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance (₹)</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {ledgers.map((ledger) => (
                <tr key={ledger._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{ledger.name}</td>
                  <td className="py-3 px-4 text-gray-600">{ledger.type}</td>
                  <td className="py-3 px-4 text-gray-600">{ledger.subType}</td>
                  <td className="py-3 px-4 text-gray-600">{ledger.category}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatCurrency(ledger.balance)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Navigate to ledger view - will be handled by parent
                          window.dispatchEvent(new CustomEvent('viewLedger', { detail: ledger._id }));
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ledger._id, ledger.name)}
                        disabled={deleteLedgerMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default LedgerList;
