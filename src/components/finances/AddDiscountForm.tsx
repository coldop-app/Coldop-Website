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

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  farmerId: string;
  createdAt: string;
  imageUrl?: string;
  costPerBag?: number;
}

interface AddDiscountFormProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: Farmer | null;
}

const AddDiscountForm = ({ isOpen, onClose, farmer }: AddDiscountFormProps) => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
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

  // Find Discount ledger (matching name "Discount")
  const discountLedger = useMemo(() => {
    return ledgers.find((ledger) =>
      ledger.name.toLowerCase() === 'discount'
    );
  }, [ledgers]);

  const farmerLedger = farmer ? ledgers.find((ledger) =>
    ledger.name.toLowerCase() === farmer.name.toLowerCase()
  ) : null;

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
      setFormData({ amount: '', narration: '' });
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
    if (!formData.amount || !discountLedger || !farmerLedger) {
      if (!discountLedger) {
        toast.error('Discount ledger not found. Please create it first.');
      } else if (!farmerLedger) {
        toast.error(`Farmer ledger for "${farmer?.name}" not found. Please create it first.`);
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

    // For Add Discount: Debit is Discount ledger, Credit is Farmer ledger
    const payload = {
      date: new Date().toISOString(),
      debitLedger: discountLedger._id,
      creditLedger: farmerLedger._id,
      amount: amount,
      narration: formData.narration || undefined
    };

    createVoucherMutation.mutate(payload);
  };

  const handleClose = () => {
    setFormData({ amount: '', narration: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Discount</DialogTitle>
          <DialogDescription>
            Add discount for {farmer?.name}
          </DialogDescription>
        </DialogHeader>

        {isLedgersLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading ledgers...</span>
          </div>
        ) : !discountLedger || !farmerLedger ? (
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                {!discountLedger && (
                  <span className="block mb-2">⚠️ "Discount" ledger not found. Please create it first.</span>
                )}
                {!farmerLedger && (
                  <span className="block">⚠️ Farmer ledger for "{farmer?.name}" not found. Please create it first.</span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Ledger Information - Horizontal Layout */}
            {discountLedger && farmerLedger && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Debit Ledger
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {discountLedger.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Credit Ledger
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {farmerLedger.name}
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
                disabled={createVoucherMutation.isPending || !formData.amount}
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

export default AddDiscountForm;
