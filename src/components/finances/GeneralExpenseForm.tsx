import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { accountingApi } from '@/lib/api/accounting';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Ledger {
  _id: string;
  name: string;
  type: string;
  subType: string;
  category: string;
}

interface GeneralExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeneralExpenseForm = ({ isOpen, onClose }: GeneralExpenseFormProps) => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    expenseLedger: '',
    paymentLedger: '',
    amount: '',
    narration: ''
  });

  // Fetch ledgers
  const { data: ledgersData, isLoading: isLedgersLoading } = useQuery({
    queryKey: ['ledgers', adminInfo?.token],
    queryFn: () => accountingApi.getLedgers({}, adminInfo?.token || ''),
    enabled: !!adminInfo?.token && isOpen,
  });

  const ledgers: Ledger[] = ledgersData?.data || [];

  // Filter ledgers: Expense type for debit, Cash/Bank Accounts for credit
  const expenseLedgers = useMemo(() => {
    return ledgers.filter((ledger) => ledger.type === 'Expense');
  }, [ledgers]);

  const cashAndBankLedgers = useMemo(() => {
    return ledgers.filter((ledger) =>
      ledger.category === 'Cash' || ledger.category === 'Bank Accounts'
    );
  }, [ledgers]);

  // Get selected ledgers
  const selectedExpenseLedger = useMemo(() => {
    return expenseLedgers.find(ledger => ledger._id === formData.expenseLedger);
  }, [expenseLedgers, formData.expenseLedger]);

  const selectedPaymentLedger = useMemo(() => {
    return cashAndBankLedgers.find(ledger => ledger._id === formData.paymentLedger);
  }, [cashAndBankLedgers, formData.paymentLedger]);

  // Create voucher mutation
  const createVoucherMutation = useMutation({
    mutationFn: (payload: {
      date: string;
      debitLedger: string;
      creditLedger: string;
      amount: number;
      narration?: string;
    }) => accountingApi.createVoucher(payload, adminInfo?.token || ''),
    onSuccess: () => {
      toast.success('Voucher created successfully');
      setFormData({ expenseLedger: '', paymentLedger: '', amount: '', narration: '' });
      onClose();
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || 'Failed to create voucher');
    }
  });

  const handleSubmit = () => {
    if (!formData.expenseLedger || !formData.paymentLedger || !formData.amount) {
      if (!formData.expenseLedger) {
        toast.error('Please select an expense ledger');
      } else if (!formData.paymentLedger) {
        toast.error('Please select a payment method (Cash or Bank Account)');
      } else {
        toast.error('Please enter an amount');
      }
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const payload = {
      date: new Date().toISOString(),
      debitLedger: formData.expenseLedger,
      creditLedger: formData.paymentLedger,
      amount: amount,
      narration: formData.narration || undefined
    };

    createVoucherMutation.mutate(payload);
  };

  const handleClose = () => {
    setFormData({ expenseLedger: '', paymentLedger: '', amount: '', narration: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>General Expense</DialogTitle>
          <DialogDescription>
            Record a general expense transaction
          </DialogDescription>
        </DialogHeader>

        {isLedgersLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading ledgers...</span>
          </div>
        ) : expenseLedgers.length === 0 || cashAndBankLedgers.length === 0 ? (
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                {expenseLedgers.length === 0 && (
                  <span className="block mb-2">⚠️ No Expense ledgers found. Please create at least one Expense ledger first.</span>
                )}
                {cashAndBankLedgers.length === 0 && (
                  <span className="block">⚠️ No Cash or Bank Account ledgers found. Please create at least one Cash or Bank Account ledger first.</span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Expense Ledger Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Expense Ledger (Debit) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.expenseLedger}
                onChange={(e) => setFormData({ ...formData, expenseLedger: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              >
                <option value="">Select Expense Ledger</option>
                {expenseLedgers.map((ledger) => (
                  <option key={ledger._id} value={ledger._id}>
                    {ledger.name} ({ledger.subType} - {ledger.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Method (Credit) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentLedger}
                onChange={(e) => setFormData({ ...formData, paymentLedger: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              >
                <option value="">Select Payment Method</option>
                {cashAndBankLedgers.map((ledger) => (
                  <option key={ledger._id} value={ledger._id}>
                    {ledger.name} ({ledger.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Ledger Information - Horizontal Layout */}
            {selectedExpenseLedger && selectedPaymentLedger && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Debit Ledger
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedExpenseLedger.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Credit Ledger
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPaymentLedger.name}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Remarks
              </label>
              <textarea
                placeholder="Enter remarks (optional)"
                value={formData.narration}
                onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
                disabled={createVoucherMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={createVoucherMutation.isPending || !formData.amount || !formData.expenseLedger || !formData.paymentLedger}
              >
                {createVoucherMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Voucher'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GeneralExpenseForm;
