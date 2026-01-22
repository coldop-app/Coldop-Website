import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { accountingApi } from '@/lib/api/accounting';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Eye, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LedgerForm from './LedgerForm';

interface Ledger {
  _id: string;
  name: string;
  type: string;
  subType: string;
  category: string;
  balance: number;
  openingBalance?: number;
  closingBalance?: number;
}

interface DateRange {
  from: string | null;
  to: string | null;
}

interface LedgerListProps {
  dateRange?: DateRange;
}

const LedgerList = ({ dateRange }: LedgerListProps) => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLedgerId, setEditingLedgerId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
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

  const deleteLedgerMutation = useMutation({
    mutationFn: (ledgerId: string) => accountingApi.deleteLedger(ledgerId, adminInfo?.token || ''),
    onSuccess: () => {
      toast.success('Ledger deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || 'Failed to delete ledger');
    }
  });

  const onViewLedger = (ledgerId: string) => {
    // Switch to ledger view tab first
    window.dispatchEvent(new CustomEvent('switchTab', { detail: 'ledger-view' }));

    // Then dispatch the viewLedger event after a small delay to ensure the component is ready
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('viewLedger', { detail: ledgerId }));
    }, 100);
  };

  const onEditLedger = (ledger: Ledger) => {
    setEditingLedgerId(ledger._id);
    setIsEditDialogOpen(true);
  };

  const onDeleteLedger = (ledgerId: string, ledgerName: string) => {
    if (window.confirm(`Are you sure you want to delete "${ledgerName}"?`)) {
      deleteLedgerMutation.mutate(ledgerId);
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingLedgerId(null);
  };

  const ledgers: Ledger[] = data?.data || [];

  const filteredLedgers = ledgers.filter((ledger) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      ledger.name.toLowerCase().includes(searchLower) ||
      ledger.type.toLowerCase().includes(searchLower) ||
      ledger.subType.toLowerCase().includes(searchLower) ||
      ledger.category.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Ledger List</h2>
        <div className="text-center py-8 text-gray-500">Loading ledgers...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Ledger List</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search ledgers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">Ledger Name</th>
                  <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap hidden sm:table-cell">Type</th>
                  <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap hidden md:table-cell">Sub-Type</th>
                  <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap hidden md:table-cell">Category</th>
                  <th className="px-2 sm:px-4 py-2 text-right whitespace-nowrap">Balance (₹)</th>
                  <th className="px-2 sm:px-4 py-2 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedgers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No ledgers found
                    </td>
                  </tr>
                ) : (
                  filteredLedgers.map((ledger) => (
                    <tr key={ledger._id} className="border-b hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 max-w-[150px] sm:max-w-none truncate sm:truncate-none">{ledger.name}</td>
                      <td className="px-2 sm:px-4 py-2 hidden sm:table-cell">{ledger.type}</td>
                      <td className="px-2 sm:px-4 py-2 hidden md:table-cell">{ledger.subType}</td>
                      <td className="px-2 sm:px-4 py-2 hidden md:table-cell">{ledger.category}</td>
                      <td className="px-2 sm:px-4 py-2 text-right font-medium whitespace-nowrap">
                        {(ledger.balance || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-center whitespace-nowrap">
                        <div className="flex gap-1 sm:gap-2 justify-center">
                          <button
                            onClick={() => onViewLedger(ledger._id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Ledger"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => onEditLedger(ledger)}
                            className="text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteLedger(ledger._id, ledger.name)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                            disabled={deleteLedgerMutation.isPending}
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Ledger Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 bg-gray-50/50">
            <DialogTitle className="text-2xl font-semibold text-gray-900">Edit Ledger</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1">
              Update the ledger details below. You can modify the type, sub-type, and category.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-6">
            {editingLedgerId && (
              <LedgerForm
                ledgerId={editingLedgerId}
                onSuccess={handleEditSuccess}
                hideCard={true}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LedgerList;
