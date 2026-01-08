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

const LedgerList = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLedgerId, setEditingLedgerId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['ledgers'],
    queryFn: () => accountingApi.getLedgers({}, adminInfo?.token || ''),
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
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Ledger List</h2>
        <div className="text-center py-8 text-gray-500">Loading ledgers...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ledger List</h2>
          <div className="relative w-64">
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Ledger Name</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Sub-Type</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Balance (₹)</th>
                <th className="px-4 py-2 text-center">Action</th>
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
                    <td className="px-4 py-2">{ledger.name}</td>
                    <td className="px-4 py-2">{ledger.type}</td>
                    <td className="px-4 py-2">{ledger.subType}</td>
                    <td className="px-4 py-2">{ledger.category}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {(ledger.balance || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onViewLedger(ledger._id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Ledger"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditLedger(ledger)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteLedger(ledger._id, ledger.name)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                          disabled={deleteLedgerMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Edit Ledger Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 bg-gray-50/50">
            <DialogTitle className="text-2xl font-semibold text-gray-900">Edit Ledger</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1">
              Update the ledger details below. Type, Sub-Type, and Category cannot be changed.
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
