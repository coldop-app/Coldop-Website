import { memo, useMemo } from 'react';
import type { CreateVoucherBody } from '@/services/accounting/vouchers/useCreateVoucher';
import { useGetAllLedgers } from '@/services/accounting/ledgers/useGetAllLedgers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';

export interface VoucherCreateFormProps {
  form: CreateVoucherBody;
  setForm: React.Dispatch<React.SetStateAction<CreateVoucherBody>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
}

const VoucherCreateForm = memo(function VoucherCreateForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  isPending,
}: VoucherCreateFormProps) {
  const { data: ledgers, isLoading: isLoadingLedgers } = useGetAllLedgers();

  const ledgerSelectorOptions: Option<string>[] = useMemo(
    () =>
      (ledgers ?? []).map((l) => ({
        value: l._id,
        label: l.name,
        searchableText: `${l.name} ${l.type} ${l.category}`,
      })),
    [ledgers]
  );

  return (
    <form onSubmit={onSubmit} className="font-custom flex flex-col gap-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="voucher-date">Date</Label>
        <Input
          id="voucher-date"
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, date: e.target.value }))
          }
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voucher-debitLedger">Debit ledger</Label>
        <SearchSelector
          id="voucher-debitLedger"
          options={ledgerSelectorOptions}
          placeholder="Search or select debit ledger"
          searchPlaceholder="Search by name, type, category..."
          value={form.debitLedger}
          onSelect={(v) =>
            setForm((prev) => ({ ...prev, debitLedger: v ?? '' }))
          }
          buttonClassName="font-custom focus-visible:ring-primary w-full justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          loading={isLoadingLedgers}
          loadingMessage="Loading ledgers..."
          emptyMessage="No ledgers found"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voucher-creditLedger">Credit ledger</Label>
        <SearchSelector
          id="voucher-creditLedger"
          options={ledgerSelectorOptions}
          placeholder="Search or select credit ledger"
          searchPlaceholder="Search by name, type, category..."
          value={form.creditLedger}
          onSelect={(v) =>
            setForm((prev) => ({ ...prev, creditLedger: v ?? '' }))
          }
          buttonClassName="font-custom focus-visible:ring-primary w-full justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          loading={isLoadingLedgers}
          loadingMessage="Loading ledgers..."
          emptyMessage="No ledgers found"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voucher-amount">Amount</Label>
        <Input
          id="voucher-amount"
          type="number"
          step="any"
          min="0.01"
          placeholder="0.00"
          value={form.amount === 0 ? '' : form.amount}
          onChange={(e) => {
            const v = e.target.value;
            const n = v === '' ? 0 : parseFloat(v);
            setForm((prev) => ({
              ...prev,
              amount: Number.isNaN(n) ? 0 : n,
            }));
          }}
          onWheel={(e) => e.currentTarget.blur()}
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="voucher-narration">Narration (optional)</Label>
        <Input
          id="voucher-narration"
          placeholder="e.g. Payment for..."
          value={form.narration ?? ''}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, narration: e.target.value }))
          }
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          disabled={
            isPending ||
            !form.debitLedger ||
            !form.creditLedger ||
            !form.amount ||
            form.amount <= 0
          }
        >
          {isPending ? 'Creating…' : 'Create'}
        </Button>
      </div>
    </form>
  );
});

export default VoucherCreateForm;
