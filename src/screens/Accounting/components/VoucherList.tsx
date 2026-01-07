import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '../constants';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Voucher {
  _id: string;
  type: string;
  voucherNumber: number;
  date: string;
  debitLedger: { _id: string; name: string };
  creditLedger: { _id: string; name: string };
  amount: number;
  narration: string;
}

const VoucherList = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['vouchers'],
    queryFn: () => storeAdminApi.getVouchers({}, adminInfo?.token || ''),
    enabled: !!adminInfo?.token
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: (voucherId: string) => storeAdminApi.deleteVoucher(voucherId, adminInfo?.token || ''),
    onSuccess: () => {
      toast.success('Voucher deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete voucher');
    }
  });

  const handleDelete = (voucherId: string) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      deleteVoucherMutation.mutate(voucherId);
    }
  };

  const vouchers: Voucher[] = data?.data || [];

  return (
    <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Voucher History</h2>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading vouchers...</div>
      ) : vouchers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No vouchers found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Debit/Receipt</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Credit/Payment</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount (₹)</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Narration</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher) => (
                <tr key={voucher._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{formatDate(voucher.date)}</td>
                  <td className="py-3 px-4 text-gray-600">{voucher.type}</td>
                  <td className="py-3 px-4 text-gray-900">{voucher.debitLedger.name}</td>
                  <td className="py-3 px-4 text-gray-900">{voucher.creditLedger.name}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatCurrency(voucher.amount)}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{voucher.narration || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Edit functionality can be added later
                          toast.info('Edit functionality coming soon');
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(voucher._id)}
                        disabled={deleteVoucherMutation.isPending}
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

export default VoucherList;
