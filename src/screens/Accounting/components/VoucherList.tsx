import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { accountingApi } from '@/lib/api/accounting';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '../constants';
import { Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import VoucherForm from './VoucherForm';

interface Ledger {
  _id: string;
  name: string;
  type: string;
  subType: string;
  category: string;
}

interface Voucher {
  _id: string;
  type: string;
  voucherNumber: number;
  date: string;
  debitLedger: string | { _id: string; name: string };
  creditLedger: string | { _id: string; name: string };
  amount: number;
  narration: string;
}

interface DateRange {
  from: string | null;
  to: string | null;
}

interface VoucherListProps {
  dateRange?: DateRange;
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

const VoucherList = ({ dateRange }: VoucherListProps) => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const queryClient = useQueryClient();
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: vouchersData, isLoading } = useQuery({
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

  const { data: ledgersData } = useQuery({
    queryKey: ['ledgers'],
    queryFn: () => accountingApi.getLedgers({}, adminInfo?.token || ''),
    enabled: !!adminInfo?.token
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: (voucherId: string) => accountingApi.deleteVoucher(voucherId, adminInfo?.token || ''),
    onSuccess: () => {
      toast.success('Voucher deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || 'Failed to delete voucher');
    }
  });

  const onDeleteVoucher = (voucherId: string) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      deleteVoucherMutation.mutate(voucherId);
    }
  };

  const onEditVoucher = (voucher: Voucher) => {
    setEditingVoucherId(voucher._id);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingVoucherId(null);
  };

  const vouchers: Voucher[] = vouchersData?.data || [];
  const ledgers: Ledger[] = ledgersData?.data || [];

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Voucher History</h2>
        <div className="text-center py-8 text-gray-500">Loading vouchers...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Voucher History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Debit/Receipt</th>
                <th className="px-4 py-2 text-left">Credit/Payment</th>
                <th className="px-4 py-2 text-right">Amount (₹)</th>
                <th className="px-4 py-2 text-left">Narration</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No vouchers created yet
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr
                    key={voucher._id}
                    className={`border-b hover:bg-gray-50 ${
                      editingVoucherId === voucher._id ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2">{formatDate(voucher.date)}</td>
                    <td className="px-4 py-2">{voucher.type}</td>
                    <td className="px-4 py-2">
                      {getLedgerName(voucher.debitLedger, ledgers)}
                    </td>
                    <td className="px-4 py-2">
                      {getLedgerName(voucher.creditLedger, ledgers)}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {voucher.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {voucher.narration || '-'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onEditVoucher(voucher)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteVoucher(voucher._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                          disabled={deleteVoucherMutation.isPending}
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Voucher</DialogTitle>
          </DialogHeader>
          {editingVoucherId && (
            <VoucherForm
              voucherId={editingVoucherId}
              onSuccess={handleEditSuccess}
              hideCard={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoucherList;
