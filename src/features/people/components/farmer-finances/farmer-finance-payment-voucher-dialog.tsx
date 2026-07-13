import { useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import type { Ledger } from '@/features/finances/components/ledger-tab/types';
import { mapLedgersToComboboxOptions } from '@/features/finances/utils/ledger-options';
import { useFarmerFinancePaymentVoucherForm } from '@/features/people/components/farmer-finances/forms/use-farmer-finance-payment-voucher-form';
import type { FarmerFinancePaymentVoucherMode } from '@/features/people/components/farmer-finances/schemas/farmer-finance-payment-voucher-form-schema';

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

type ComboboxUiState = {
  search: string;
  open: boolean;
};

const emptyComboboxState = (): ComboboxUiState => ({
  search: '',
  open: false,
});

export type FarmerFinancePaymentVoucherDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: FarmerFinancePaymentVoucherMode;
  title: string;
  description: string;
  farmerLedger: Ledger | null;
  paymentLedgers: Ledger[];
  isLoadingLedgers: boolean;
  missingLedgers: string[];
  submitLabel: string;
};

type FarmerFinancePaymentVoucherDialogContentProps = Omit<
  FarmerFinancePaymentVoucherDialogProps,
  'open' | 'farmerLedger' | 'paymentLedgers' | 'isLoadingLedgers' | 'missingLedgers'
> & {
  farmerLedger: Ledger;
  paymentLedgerOptions: ComboboxOption[];
};

function FarmerFinancePaymentVoucherDialogContent({
  onOpenChange,
  mode,
  title,
  description,
  farmerLedger,
  paymentLedgerOptions,
  submitLabel,
}: FarmerFinancePaymentVoucherDialogContentProps) {
  const portalContainerRef = useRef<HTMLFormElement>(null);
  const [paymentCombobox, setPaymentCombobox] = useState(emptyComboboxState);
  const { mutateAsync: createVoucher } = useCreateVoucher();

  const sortedPaymentLedgers = useMemo(
    () => filterAndSortOptions(paymentCombobox.search, paymentLedgerOptions),
    [paymentCombobox.search, paymentLedgerOptions],
  );

  const form = useFarmerFinancePaymentVoucherForm({
    mode,
    farmerLedgerId: farmerLedger.id,
    onSubmit: async (payload) => {
      try {
        await createVoucher(payload);
        toast.success('Voucher created successfully', {
          position: 'bottom-right',
        });
        form.reset();
        setPaymentCombobox(emptyComboboxState());
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create voucher', {
          position: 'bottom-right',
        });
      }
    },
  });

  const formId = useMemo(
    () => `farmer-finance-payment-${mode}-${submitLabel.toLowerCase().replace(/\s+/g, '-')}`,
    [mode, submitLabel],
  );

  const selectableFieldId = `${formId}-payment-ledger`;
  const selectableLabel = mode === 'receive' ? 'Debit ledger' : 'Credit ledger';
  const fixedLabel = mode === 'receive' ? 'Credit ledger' : 'Debit ledger';

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      setPaymentCombobox(emptyComboboxState());
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
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
          <DialogTitle className="font-heading text-base font-semibold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          id={formId}
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

            {mode === 'receive' ? (
              <form.Field name="paymentLedger">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={selectableFieldId}>{selectableLabel}</FieldLabel>
                      <SearchableOptionCombobox
                        id={selectableFieldId}
                        name={field.name}
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        onBlur={field.handleBlur}
                        isInvalid={isInvalid}
                        placeholder="Search Cash or Bank Accounts..."
                        emptyMessage="No matching ledgers found."
                        options={paymentLedgerOptions}
                        sortedOptions={sortedPaymentLedgers}
                        search={paymentCombobox.search}
                        setSearch={(search) =>
                          setPaymentCombobox((current) => ({
                            ...current,
                            search,
                          }))
                        }
                        open={paymentCombobox.open}
                        setOpen={(open) => setPaymentCombobox((current) => ({ ...current, open }))}
                        portalContainer={portalContainerRef}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            ) : null}

            <Field>
              <FieldLabel htmlFor={`${formId}-fixed-ledger`}>{fixedLabel}</FieldLabel>
              <Input
                id={`${formId}-fixed-ledger`}
                value={farmerLedger.name}
                readOnly
                className="bg-muted/50"
              />
            </Field>

            {mode === 'add' ? (
              <form.Field name="paymentLedger">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={selectableFieldId}>{selectableLabel}</FieldLabel>
                      <SearchableOptionCombobox
                        id={selectableFieldId}
                        name={field.name}
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        onBlur={field.handleBlur}
                        isInvalid={isInvalid}
                        placeholder="Search Cash or Bank Accounts..."
                        emptyMessage="No matching ledgers found."
                        options={paymentLedgerOptions}
                        sortedOptions={sortedPaymentLedgers}
                        search={paymentCombobox.search}
                        setSearch={(search) =>
                          setPaymentCombobox((current) => ({
                            ...current,
                            search,
                          }))
                        }
                        open={paymentCombobox.open}
                        setOpen={(open) => setPaymentCombobox((current) => ({ ...current, open }))}
                        portalContainer={portalContainerRef}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            ) : null}

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

export function FarmerFinancePaymentVoucherDialog({
  open,
  onOpenChange,
  mode,
  title,
  description,
  farmerLedger,
  paymentLedgers,
  isLoadingLedgers,
  missingLedgers,
  submitLabel,
}: FarmerFinancePaymentVoucherDialogProps) {
  const paymentLedgerOptions = useMemo(
    () => mapLedgersToComboboxOptions(paymentLedgers),
    [paymentLedgers],
  );

  const isReady = Boolean(farmerLedger && paymentLedgers.length > 0);

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

  if (!farmerLedger) {
    return null;
  }

  return (
    <FarmerFinancePaymentVoucherDialogContent
      onOpenChange={handleOpenChange}
      mode={mode}
      title={title}
      description={description}
      farmerLedger={farmerLedger}
      paymentLedgerOptions={paymentLedgerOptions}
      submitLabel={submitLabel}
    />
  );
}
