import { useMemo, useState } from 'react';
import type { CreateVoucherBody } from '@/services/accounting/vouchers/useCreateVoucher';
import { useCreateVoucher } from '@/services/accounting/vouchers/useCreateVoucher';
import { useGetAllLedgers } from '@/services/accounting/ledgers/useGetAllLedgers';
import type { Ledger } from '@/services/accounting/ledgers/useGetAllLedgers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';

function isExpenseLedger(l: Ledger): boolean {
  return l.type === 'Expense';
}

function isCashOrBankLedger(l: Ledger): boolean {
  const cat = (l.category ?? '').toLowerCase();
  return cat === 'cash' || cat.includes('bank');
}

export function GeneralExpenseModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: ledgers, isLoading: isLoadingLedgers } = useGetAllLedgers();
  const createVoucher = useCreateVoucher();
  const [form, setForm] = useState<CreateVoucherBody>({
    date: new Date().toISOString().slice(0, 10),
    debitLedger: '',
    creditLedger: '',
    amount: 0,
    narration: '',
  });

  const debitOptions: Option<string>[] = useMemo(
    () =>
      (ledgers ?? [])
        .filter(isExpenseLedger)
        .map((l) => ({
          value: l._id,
          label: l.name,
          searchableText: `${l.name} ${l.type} ${l.category}`,
        })),
    [ledgers]
  );

  const creditOptions: Option<string>[] = useMemo(
    () =>
      (ledgers ?? [])
        .filter(isCashOrBankLedger)
        .map((l) => ({
          value: l._id,
          label: l.name,
          searchableText: `${l.name} ${l.type} ${l.category}`,
        })),
    [ledgers]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateIso =
      form.date.includes('T') ? form.date : `${form.date}T00:00:00.000Z`;
    const payload: CreateVoucherBody = {
      date: dateIso,
      debitLedger: form.debitLedger,
      creditLedger: form.creditLedger,
      amount: Number(form.amount),
      narration: form.narration?.trim() || undefined,
    };
    createVoucher.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
        setForm({
          date: new Date().toISOString().slice(0, 10),
          debitLedger: '',
          creditLedger: '',
          amount: 0,
          narration: '',
        });
      },
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-custom sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>General Expense</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="font-custom flex flex-col gap-4 pt-2"
        >
          <div className="space-y-2">
            <Label htmlFor="general-expense-date">Date</Label>
            <Input
              id="general-expense-date"
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
            <Label htmlFor="general-expense-debitLedger">Debit ledger</Label>
            <SearchSelector
              id="general-expense-debitLedger"
              options={debitOptions}
              placeholder="Search or select expense ledger"
              searchPlaceholder="Search by name, type, category..."
              value={form.debitLedger}
              onSelect={(v) =>
                setForm((prev) => ({ ...prev, debitLedger: v ?? '' }))
              }
              buttonClassName="font-custom focus-visible:ring-primary w-full justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              loading={isLoadingLedgers}
              loadingMessage="Loading ledgers..."
              emptyMessage="No expense ledgers found"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="general-expense-creditLedger">Credit ledger</Label>
            <SearchSelector
              id="general-expense-creditLedger"
              options={creditOptions}
              placeholder="Search or select cash/bank ledger"
              searchPlaceholder="Search by name, type, category..."
              value={form.creditLedger}
              onSelect={(v) =>
                setForm((prev) => ({ ...prev, creditLedger: v ?? '' }))
              }
              buttonClassName="font-custom focus-visible:ring-primary w-full justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              loading={isLoadingLedgers}
              loadingMessage="Loading ledgers..."
              emptyMessage="No cash/bank ledgers found"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="general-expense-amount">Amount</Label>
            <Input
              id="general-expense-amount"
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
              className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="general-expense-narration">Narration (optional)</Label>
            <Input
              id="general-expense-narration"
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
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              disabled={
                createVoucher.isPending ||
                !form.debitLedger ||
                !form.creditLedger ||
                !form.amount ||
                form.amount <= 0
              }
            >
              {createVoucher.isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
