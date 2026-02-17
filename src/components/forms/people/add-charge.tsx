import { memo, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  useCreateVoucher,
  type CreateVoucherBody,
} from '@/services/accounting/vouchers/useCreateVoucher';
import { useGetAllLedgers } from '@/services/accounting/ledgers/useGetAllLedgers';
import { formatDate, formatDateToISO } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/forms/date-picker';

type FieldErrors = Array<{ message?: string } | undefined>;

const OTHER_INCOME_LEDGER_NAME = 'Other Income';

export interface AddChargeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Farmer storage link ID (fixed from farmer profile when opened from there) */
  defaultFarmerStorageLinkId?: string | null;
  /** Farmer name for subtitle and debit ledger display */
  farmerName?: string;
}

const AddChargeForm = memo(function AddChargeForm({
  onSuccess,
  onCancel,
  defaultFarmerStorageLinkId,
  farmerName = 'Farmer',
}: AddChargeFormProps) {
  const { mutate: createVoucher, isPending } = useCreateVoucher();
  const { data: ledgers, isLoading: isLoadingLedgers } = useGetAllLedgers();

  const { otherIncomeLedger, farmerLedger } = useMemo(() => {
    const list = ledgers ?? [];
    const otherIncome =
      list.find(
        (l) =>
          l.name === OTHER_INCOME_LEDGER_NAME && (l.isSystemLedger ?? true)
      ) ?? list.find((l) => l.name === OTHER_INCOME_LEDGER_NAME);
    const farmer = defaultFarmerStorageLinkId
      ? list.find((l) => l.farmerStorageLinkId === defaultFarmerStorageLinkId)
      : null;
    return {
      otherIncomeLedger: otherIncome ?? null,
      farmerLedger: farmer ?? null,
    };
  }, [ledgers, defaultFarmerStorageLinkId]);

  const canSubmit = Boolean(otherIncomeLedger) && Boolean(farmerLedger);

  const form = useForm({
    defaultValues: {
      date: formatDate(new Date()),
      amount: 0,
      narration: '',
    },
    onSubmit: async ({ value }) => {
      if (!otherIncomeLedger || !farmerLedger) return;
      const payload: CreateVoucherBody = {
        date: formatDateToISO(value.date),
        debitLedger: farmerLedger._id,
        creditLedger: otherIncomeLedger._id,
        amount: value.amount,
        narration: value.narration || undefined,
        farmerStorageLinkId: defaultFarmerStorageLinkId ?? undefined,
      };
      createVoucher(payload, {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="font-custom flex min-w-0 flex-col gap-2.5 sm:gap-4"
    >
      {/* Fixed ledger display card – compact on mobile */}
      <Card className="border-border bg-muted/30 overflow-hidden rounded-lg shadow-sm sm:rounded-xl">
        <CardContent className="p-2.5 sm:p-5">
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
            <div className="min-w-0 py-0.5 sm:py-0">
              <p className="font-custom text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
                Debit ledger
              </p>
              <p className="font-custom text-foreground mt-0.5 text-sm leading-tight font-bold sm:mt-1.5 sm:text-lg">
                {farmerName}
              </p>
            </div>
            <div className="min-w-0 pt-2 sm:pt-0">
              <p className="font-custom text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
                Credit ledger
              </p>
              <p className="font-custom text-foreground mt-0.5 text-sm leading-tight font-bold sm:mt-1.5 sm:text-lg">
                {isLoadingLedgers
                  ? 'Loading…'
                  : (otherIncomeLedger?.name ?? 'Other Income')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isLoadingLedgers && !canSubmit && (
        <p className="font-custom text-destructive text-xs sm:text-sm">
          {!otherIncomeLedger
            ? 'Other Income ledger not found.'
            : !farmerLedger
              ? 'Farmer ledger not found.'
              : 'Ledgers unavailable.'}
        </p>
      )}

      <FieldGroup className="space-y-2 sm:space-y-4">
        <form.Field
          name="date"
          children={(field) => (
            <Field className="gap-1.5 sm:gap-3">
              <DatePicker
                id="add-charge-date"
                label="Date"
                value={field.state.value}
                onChange={(v) => field.handleChange(v)}
                fullWidth
              />
            </Field>
          )}
        />

        <form.Field
          name="amount"
          children={(field) => {
            const numValue = field.state.value;
            const isInvalid =
              field.state.meta.isTouched &&
              (numValue <= 0 || Number.isNaN(numValue));
            return (
              <Field data-invalid={isInvalid} className="gap-1.5 sm:gap-3">
                <FieldLabel htmlFor="add-charge-amount">
                  Amount (₹) <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="add-charge-amount"
                  name={field.name}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0.01"
                  placeholder="Enter amount"
                  value={numValue === 0 ? '' : numValue}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const v = e.target.value;
                    const n = v === '' ? 0 : parseFloat(v);
                    field.handleChange(Number.isNaN(n) ? 0 : n);
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                      e.preventDefault();
                    }
                  }}
                  aria-invalid={isInvalid}
                  className="font-custom focus-visible:ring-primary h-9 min-h-9 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-auto sm:min-h-0 [&]:[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                {isInvalid && numValue <= 0 && (
                  <FieldError
                    errors={
                      [
                        { message: 'Amount must be greater than 0' },
                      ] as FieldErrors
                    }
                  />
                )}
              </Field>
            );
          }}
        />

        <form.Field
          name="narration"
          children={(field) => (
            <Field className="gap-1.5 sm:gap-3">
              <FieldLabel htmlFor="add-charge-narration">Remarks</FieldLabel>
              <Input
                id="add-charge-narration"
                name={field.name}
                placeholder="Enter remarks (optional)"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="font-custom focus-visible:ring-primary h-9 min-h-9 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-auto sm:min-h-0"
              />
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 pt-0.5 sm:flex-row sm:justify-end sm:gap-3 sm:pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="font-custom focus-visible:ring-primary h-9 min-h-9 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-9 sm:min-h-0 sm:w-auto"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="font-custom focus-visible:ring-primary h-9 min-h-9 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-9 sm:min-h-0 sm:w-auto"
          disabled={isPending || !canSubmit}
        >
          {isPending ? 'Creating…' : 'Create voucher'}
        </Button>
      </div>
    </form>
  );
});

export default AddChargeForm;
