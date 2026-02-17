import { memo } from 'react';
import type { Voucher } from '@/services/accounting/vouchers/useGetAllVouchers';
import type { UpdateVoucherBody } from '@/services/accounting/vouchers/useUpdateVoucher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface VoucherEditFormProps {
  voucher: Voucher | null;
  form: UpdateVoucherBody;
  setForm: React.Dispatch<React.SetStateAction<UpdateVoucherBody>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
  hasChanges: boolean;
}

const VoucherEditForm = memo(function VoucherEditForm({
  voucher,
  form,
  setForm,
  onSubmit,
  onCancel,
  isPending,
  hasChanges,
}: VoucherEditFormProps) {
  return (
    <form onSubmit={onSubmit} className="font-custom flex flex-col gap-4 pt-2">
      {voucher && (
        <p className="font-custom text-muted-foreground text-sm">
          Voucher #{voucher.voucherNumber} — Date, debit and credit ledgers
          cannot be changed.
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="edit-voucher-amount">Amount</Label>
        <Input
          id="edit-voucher-amount"
          type="number"
          step="any"
          min="0.01"
          placeholder="0.00"
          value={form.amount ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            const n = v === '' ? undefined : parseFloat(v);
            setForm((prev) => ({
              ...prev,
              amount: n === undefined || Number.isNaN(n) ? undefined : n,
            }));
          }}
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-voucher-narration">Narration (optional)</Label>
        <Input
          id="edit-voucher-narration"
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
          disabled={isPending || !hasChanges}
        >
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
});

export default VoucherEditForm;
