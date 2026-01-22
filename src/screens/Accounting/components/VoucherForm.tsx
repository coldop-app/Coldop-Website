import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { accountingApi } from '@/lib/api/accounting';
import { Plus, Check, X, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import GeneralExpenseForm from '@/components/finances/GeneralExpenseForm';

const voucherTypes = ['Journal'];

interface Ledger {
  _id: string;
  name: string;
  type: string;
  subType: string;
  category: string;
}

interface VoucherFormProps {
  voucherId?: string;
  onSuccess?: () => void;
  hideCard?: boolean;
}

const VoucherForm = ({ voucherId, onSuccess, hideCard = false }: VoucherFormProps) => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const queryClient = useQueryClient();
  const editingVoucherId = voucherId || null;
  const [isGeneralExpenseOpen, setIsGeneralExpenseOpen] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    type: 'Journal',
    date: new Date().toISOString().split('T')[0],
    debitLedger: '',
    creditLedger: '',
    amount: '',
    narration: ''
  });

  const { data: ledgersData } = useQuery({
    queryKey: ['ledgers'],
    queryFn: () => accountingApi.getLedgers({}, adminInfo?.token || ''),
    enabled: !!adminInfo?.token
  });

  const { data: voucherData } = useQuery({
    queryKey: ['voucher', voucherId],
    queryFn: () => accountingApi.getVoucherById(voucherId!, adminInfo?.token || ''),
    enabled: !!editingVoucherId && !!voucherId && !!adminInfo?.token
  });

  // Populate form when voucher data is loaded
  useEffect(() => {
    if (voucherData?.data && editingVoucherId) {
      const voucher = voucherData.data;
      const voucherDate = new Date(voucher.date);
      setNewVoucher({
        type: voucher.type || 'Journal',
        date: voucherDate.toISOString().split('T')[0],
        debitLedger: voucher.debitLedger?._id || '',
        creditLedger: voucher.creditLedger?._id || '',
        amount: voucher.amount?.toString() || '',
        narration: voucher.narration || ''
      });
    }
  }, [voucherData, editingVoucherId]);

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
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || 'Failed to create voucher');
    }
  });

  const updateVoucherMutation = useMutation({
    mutationFn: (payload: {
      date?: string;
      debitLedger?: string;
      creditLedger?: string;
      amount?: number;
      narration?: string;
    }) => accountingApi.updateVoucher(voucherId!, payload, adminInfo?.token || ''),
    onSuccess: () => {
      toast.success('Voucher updated successfully');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      queryClient.invalidateQueries({ queryKey: ['voucher', voucherId] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || 'Failed to update voucher');
    }
  });

  const resetForm = () => {
    setNewVoucher({
      type: 'Journal',
      date: new Date().toISOString().split('T')[0],
      debitLedger: '',
      creditLedger: '',
      amount: '',
      narration: ''
    });
  };

  const onAddVoucher = () => {
    if (!newVoucher.debitLedger || !newVoucher.creditLedger || !newVoucher.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      date: new Date(newVoucher.date).toISOString(),
      debitLedger: newVoucher.debitLedger,
      creditLedger: newVoucher.creditLedger,
      amount: parseFloat(newVoucher.amount),
      narration: newVoucher.narration || ''
    };

    if (editingVoucherId) {
      updateVoucherMutation.mutate(payload);
    } else {
      createVoucherMutation.mutate(payload);
    }
  };

  const onCancelEdit = () => {
    resetForm();
    onSuccess?.();
  };

  const ledgers: Ledger[] = ledgersData?.data || [];

  const isLoading = !!editingVoucherId && !voucherData;
  const isPending = createVoucherMutation.isPending || updateVoucherMutation.isPending;

  const formContent = (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">
          {editingVoucherId ? "Edit Voucher Entry" : "Create Voucher Entry"}
        </h2>
        {!editingVoucherId && (
          <button
            onClick={() => setIsGeneralExpenseOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm sm:text-base"
            title="Add General Expense"
          >
            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">General Expense</span>
            <span className="sm:hidden">Expense</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Voucher Type</label>
          <select
            value={newVoucher.type}
            onChange={(e) =>
              setNewVoucher({ ...newVoucher, type: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          >
            {voucherTypes.map((type) => (
              <option key={type} value={type}>
                {type} Voucher
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={newVoucher.date}
            onChange={(e) =>
              setNewVoucher({ ...newVoucher, date: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Debit Ledger
          </label>
          <select
            value={newVoucher.debitLedger}
            onChange={(e) =>
              setNewVoucher({
                ...newVoucher,
                debitLedger: e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Debit Ledger</option>
            {ledgers.map((ledger) => (
              <option key={ledger._id} value={ledger._id}>
                {ledger.name} ({ledger.type})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Credit Ledger
          </label>
          <select
            value={newVoucher.creditLedger}
            onChange={(e) =>
              setNewVoucher({
                ...newVoucher,
                creditLedger: e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Credit Ledger</option>
            {ledgers.map((ledger) => (
              <option key={ledger._id} value={ledger._id}>
                {ledger.name} ({ledger.type})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Amount (₹)</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={newVoucher.amount}
            onChange={(e) =>
              setNewVoucher({ ...newVoucher, amount: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Narration</label>
          <input
            type="text"
            placeholder="Description"
            value={newVoucher.narration}
            onChange={(e) =>
              setNewVoucher({
                ...newVoucher,
                narration: e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onAddVoucher}
          disabled={isPending || isLoading}
          className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-xs sm:text-sm lg:text-base font-medium inline-flex items-center justify-center gap-1 sm:gap-2 shadow-sm hover:shadow relative disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            "Loading..."
          ) : isPending ? (
            editingVoucherId ? "Updating..." : "Creating..."
          ) : editingVoucherId ? (
            <>
              <Check className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
              Update Voucher
            </>
          ) : (
            <>
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
              Create Voucher
            </>
          )}
        </button>
        {editingVoucherId && (
          <button
            onClick={onCancelEdit}
            className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-xs sm:text-sm lg:text-base font-medium inline-flex items-center justify-center gap-1 sm:gap-2 shadow-sm hover:shadow relative"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  if (hideCard) {
    return (
      <>
        {formContent}
        <GeneralExpenseForm
          isOpen={isGeneralExpenseOpen}
          onClose={() => setIsGeneralExpenseOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      {formContent}
      <GeneralExpenseForm
        isOpen={isGeneralExpenseOpen}
        onClose={() => setIsGeneralExpenseOpen(false)}
      />
    </>
  );
};

export default VoucherForm;
