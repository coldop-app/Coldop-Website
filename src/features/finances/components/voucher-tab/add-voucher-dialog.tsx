import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { DatePickerInput } from '@/components/date-picker';
import {
  filterAndSortOptions,
  SearchableOptionCombobox,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
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

import { useAddVoucherForm } from './forms/use-add-voucher-form';

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

const numericInputProps = {
  type: 'number' as const,
  step: '0.01',
  min: 0.01,
  inputMode: 'decimal' as const,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

type AddVoucherDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debitLedgerOptions: ComboboxOption[];
  creditLedgerOptions: ComboboxOption[];
  title?: string;
  description?: string;
  submitLabel?: string;
  submittingLabel?: string;
};

type ComboboxUiState = {
  search: string;
  open: boolean;
};

const emptyComboboxState = (): ComboboxUiState => ({
  search: '',
  open: false,
});

function resetDialogState(
  form: ReturnType<typeof useAddVoucherForm>,
  resetComboboxState: () => void,
) {
  form.reset();
  resetComboboxState();
}

export function AddVoucherDialog({
  open,
  onOpenChange,
  debitLedgerOptions,
  creditLedgerOptions,
  title = 'Add Voucher',
  description = 'Record a debit and credit entry with amount and narration.',
  submitLabel = 'Add Voucher',
  submittingLabel = 'Adding…',
}: AddVoucherDialogProps) {
  const portalContainerRef = useRef<HTMLFormElement>(null);
  const [debitCombobox, setDebitCombobox] = useState(emptyComboboxState);
  const [creditCombobox, setCreditCombobox] = useState(emptyComboboxState);

  const resetComboboxState = () => {
    setDebitCombobox(emptyComboboxState());
    setCreditCombobox(emptyComboboxState());
  };

  const { mutateAsync: createVoucher } = useCreateVoucher();

  const form = useAddVoucherForm({
    onSubmit: async (payload) => {
      try {
        await createVoucher(payload);
        toast.success('Voucher created successfully', {
          position: 'bottom-right',
        });
        resetDialogState(form, resetComboboxState);
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create voucher', {
          position: 'bottom-right',
        });
      }
    },
  });

  const sortedDebitLedgers = useMemo(
    () => filterAndSortOptions(debitCombobox.search, debitLedgerOptions),
    [debitCombobox.search, debitLedgerOptions],
  );

  const sortedCreditLedgers = useMemo(
    () => filterAndSortOptions(creditCombobox.search, creditLedgerOptions),
    [creditCombobox.search, creditLedgerOptions],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialogState(form, resetComboboxState);
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg"
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest('[data-slot="combobox-content"]')) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          id="add-voucher-form"
          noValidate
          ref={portalContainerRef}
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
                      id="add-voucher-date"
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

            <form.Field name="debitLedger">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="add-voucher-debit-ledger">Debit ledger</FieldLabel>
                    <SearchableOptionCombobox
                      id="add-voucher-debit-ledger"
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      onBlur={field.handleBlur}
                      isInvalid={isInvalid}
                      placeholder="Search debit ledgers..."
                      emptyMessage="No ledgers found."
                      options={debitLedgerOptions}
                      sortedOptions={sortedDebitLedgers}
                      search={debitCombobox.search}
                      setSearch={(search) =>
                        setDebitCombobox((current) => ({ ...current, search }))
                      }
                      open={debitCombobox.open}
                      setOpen={(open) => setDebitCombobox((current) => ({ ...current, open }))}
                      portalContainer={portalContainerRef}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="creditLedger">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="add-voucher-credit-ledger">Credit ledger</FieldLabel>
                    <SearchableOptionCombobox
                      id="add-voucher-credit-ledger"
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      onBlur={field.handleBlur}
                      isInvalid={isInvalid}
                      placeholder="Search credit ledgers..."
                      emptyMessage="No ledgers found."
                      options={creditLedgerOptions}
                      sortedOptions={sortedCreditLedgers}
                      search={creditCombobox.search}
                      setSearch={(search) =>
                        setCreditCombobox((current) => ({ ...current, search }))
                      }
                      open={creditCombobox.open}
                      setOpen={(open) => setCreditCombobox((current) => ({ ...current, open }))}
                      portalContainer={portalContainerRef}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="amount">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="add-voucher-amount">Amount</FieldLabel>
                    <Input
                      id="add-voucher-amount"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="0.00"
                      className="tabular-nums"
                      {...numericInputProps}
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
                    <FieldLabel htmlFor="add-voucher-narration">Narration</FieldLabel>
                    <Textarea
                      id="add-voucher-narration"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Describe the transaction"
                      className="min-h-[96px] resize-y"
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
              <Button type="submit" form="add-voucher-form" disabled={isSubmitting}>
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
