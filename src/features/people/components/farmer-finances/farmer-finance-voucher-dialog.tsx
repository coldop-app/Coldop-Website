import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { DatePickerInput } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateVoucher } from '@/features/finances/api/use-create-voucher';
import type { Ledger } from '@/features/finances/components/ledger-tab/types';
import { useFarmerFinanceVoucherForm } from '@/features/people/components/farmer-finances/forms/use-farmer-finance-voucher-form';

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

export type FarmerFinanceVoucherDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  debitLedger: Ledger | null;
  creditLedger: Ledger | null;
  isLoadingLedgers: boolean;
  missingLedgers: string[];
  submitLabel: string;
};

type FarmerFinanceVoucherDialogContentProps = Omit<FarmerFinanceVoucherDialogProps, 'open'> & {
  debitLedger: Ledger;
  creditLedger: Ledger;
};

function FarmerFinanceVoucherDialogContent({
  onOpenChange,
  title,
  description,
  debitLedger,
  creditLedger,
  submitLabel,
}: FarmerFinanceVoucherDialogContentProps) {
  const { mutateAsync: createVoucher } = useCreateVoucher();

  const form = useFarmerFinanceVoucherForm({
    debitLedgerId: debitLedger.id,
    creditLedgerId: creditLedger.id,
    onSubmit: async (payload) => {
      try {
        await createVoucher(payload);
        toast.success('Voucher created successfully', {
          position: 'bottom-right',
        });
        form.reset();
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create voucher', {
          position: 'bottom-right',
        });
      }
    },
  });

  const formId = useMemo(
    () => `farmer-finance-voucher-${submitLabel.toLowerCase().replace(/\s+/g, '-')}`,
    [submitLabel],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-base font-semibold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-4">
            <form.Field name="date">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);

                return (
                  <Field data-invalid={isInvalid}>
                    <DatePickerInput
                      id={`${formId}-date`}
                      label="Date"
                      value={field.state.value ? new Date(field.state.value) : undefined}
                      onChange={(date) => field.handleChange(date ? date.toISOString() : '')}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      placeholder="Pick a date"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <Field>
              <FieldLabel htmlFor={`${formId}-debit-ledger`}>Debit ledger</FieldLabel>
              <Input
                id={`${formId}-debit-ledger`}
                value={debitLedger.name}
                readOnly
                className="bg-muted/50"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`${formId}-credit-ledger`}>Credit ledger</FieldLabel>
              <Input
                id={`${formId}-credit-ledger`}
                value={creditLedger.name}
                readOnly
                className="bg-muted/50"
              />
            </Field>

            <form.Field name="amount">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={`${formId}-amount`}>Amount</FieldLabel>
                    <Input
                      id={`${formId}-amount`}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="0.00"
                      className="tabular-nums"
                      type="number"
                      step="0.01"
                      min={0.01}
                      inputMode="decimal"
                      onWheel={(event) => event.currentTarget.blur()}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="narration">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={`${formId}-narration`}>Narration</FieldLabel>
                    <Textarea
                      id={`${formId}-narration`}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Describe the transaction"
                      className="min-h-[120px] resize-y"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button type="submit" form={formId} disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : submitLabel}
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FarmerFinanceVoucherDialog({
  open,
  onOpenChange,
  title,
  description,
  debitLedger,
  creditLedger,
  isLoadingLedgers,
  missingLedgers,
  submitLabel,
}: FarmerFinanceVoucherDialogProps) {
  const isReady = Boolean(debitLedger && creditLedger);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  if (!open) {
    return null;
  }

  if (isLoadingLedgers) {
    return (
      <Dialog open onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-base font-semibold">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading ledgers…
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isReady || missingLedgers.length > 0) {
    return (
      <Dialog open onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-base font-semibold">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <p className="text-destructive text-sm">
            {missingLedgers.length > 0
              ? `Missing ledgers: ${missingLedgers.join(', ')}.`
              : 'Required ledgers could not be loaded.'}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!debitLedger || !creditLedger) {
    return null;
  }

  return (
    <FarmerFinanceVoucherDialogContent
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      debitLedger={debitLedger}
      creditLedger={creditLedger}
      isLoadingLedgers={isLoadingLedgers}
      missingLedgers={missingLedgers}
      submitLabel={submitLabel}
    />
  );
}
