import { useMemo, useState } from 'react';
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
import { useUpdateVoucher } from '@/features/finances/api/use-update-voucher';

import { useEditVoucherForm } from './forms/use-edit-voucher-form';
import { voucherToFormValues } from './schemas/add-voucher-form-schema';
import type { Voucher } from './types';

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

type EditVoucherDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: Voucher;
  ledgerOptions: ComboboxOption[];
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
  form: ReturnType<typeof useEditVoucherForm>,
  voucher: Voucher,
  ledgerOptions: ComboboxOption[],
  resetComboboxState: () => void,
) {
  form.reset(voucherToFormValues(voucher, ledgerOptions));
  resetComboboxState();
}

export function EditVoucherDialog({
  open,
  onOpenChange,
  voucher,
  ledgerOptions,
}: EditVoucherDialogProps) {
  const [debitCombobox, setDebitCombobox] = useState(emptyComboboxState);
  const [creditCombobox, setCreditCombobox] = useState(emptyComboboxState);

  const resetComboboxState = () => {
    setDebitCombobox(emptyComboboxState());
    setCreditCombobox(emptyComboboxState());
  };

  const { mutateAsync: updateVoucher } = useUpdateVoucher();

  const form = useEditVoucherForm({
    voucher,
    ledgerOptions,
    onSubmit: async (payload) => {
      try {
        await updateVoucher({ id: voucher.id, payload });
        toast.success('Voucher updated successfully', {
          position: 'bottom-right',
        });
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update voucher', {
          position: 'bottom-right',
        });
      }
    },
  });

  const sortedDebitLedgers = useMemo(
    () => filterAndSortOptions(debitCombobox.search, ledgerOptions),
    [debitCombobox.search, ledgerOptions],
  );

  const sortedCreditLedgers = useMemo(
    () => filterAndSortOptions(creditCombobox.search, ledgerOptions),
    [creditCombobox.search, ledgerOptions],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialogState(form, voucher, ledgerOptions, resetComboboxState);
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Edit Voucher #{voucher.voucherNo}
          </DialogTitle>
          <DialogDescription>
            Update the debit and credit entry, amount, or narration.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-voucher-form"
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
                      id="edit-voucher-date"
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
                    <FieldLabel htmlFor="edit-voucher-debit-ledger">Debit ledger</FieldLabel>
                    <SearchableOptionCombobox
                      id="edit-voucher-debit-ledger"
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      onBlur={field.handleBlur}
                      isInvalid={isInvalid}
                      placeholder="Search debit ledgers..."
                      emptyMessage="No ledgers found."
                      options={ledgerOptions}
                      sortedOptions={sortedDebitLedgers}
                      search={debitCombobox.search}
                      setSearch={(search) =>
                        setDebitCombobox((current) => ({ ...current, search }))
                      }
                      open={debitCombobox.open}
                      setOpen={(open) => setDebitCombobox((current) => ({ ...current, open }))}
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
                    <FieldLabel htmlFor="edit-voucher-credit-ledger">Credit ledger</FieldLabel>
                    <SearchableOptionCombobox
                      id="edit-voucher-credit-ledger"
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      onBlur={field.handleBlur}
                      isInvalid={isInvalid}
                      placeholder="Search credit ledgers..."
                      emptyMessage="No ledgers found."
                      options={ledgerOptions}
                      sortedOptions={sortedCreditLedgers}
                      search={creditCombobox.search}
                      setSearch={(search) =>
                        setCreditCombobox((current) => ({ ...current, search }))
                      }
                      open={creditCombobox.open}
                      setOpen={(open) => setCreditCombobox((current) => ({ ...current, open }))}
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
                    <FieldLabel htmlFor="edit-voucher-amount">Amount</FieldLabel>
                    <Input
                      id="edit-voucher-amount"
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
                    <FieldLabel htmlFor="edit-voucher-narration">Narration</FieldLabel>
                    <Textarea
                      id="edit-voucher-narration"
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
              <Button type="submit" form="edit-voucher-form" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
