import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  filterAndSortOptions,
  SearchableOptionCombobox,
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useUpdateLedger } from '@/features/finances/api/use-update-ledger';

import {
  getCategoryOptionsForTypeSubType,
  getSubTypeOptionsForType,
  LEDGER_TYPE_OPTIONS,
} from './constants/ledger-options';
import { useEditLedgerForm } from './forms/use-edit-ledger-form';
import { ledgerToFormValues } from './schemas/add-ledger-form-schema';
import type { Ledger } from './types';

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

const numericInputProps = {
  type: 'number' as const,
  step: '0.01',
  inputMode: 'decimal' as const,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

type EditLedgerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ledger: Ledger;
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
  form: ReturnType<typeof useEditLedgerForm>,
  ledger: Ledger,
  resetComboboxState: () => void,
) {
  form.reset(ledgerToFormValues(ledger));
  resetComboboxState();
}

export function EditLedgerDialog({ open, onOpenChange, ledger }: EditLedgerDialogProps) {
  const portalContainerRef = useRef<HTMLFormElement>(null);
  const [typeCombobox, setTypeCombobox] = useState(emptyComboboxState);
  const [subTypeCombobox, setSubTypeCombobox] = useState(emptyComboboxState);
  const [categoryCombobox, setCategoryCombobox] = useState(emptyComboboxState);

  const resetComboboxState = () => {
    setTypeCombobox(emptyComboboxState());
    setSubTypeCombobox(emptyComboboxState());
    setCategoryCombobox(emptyComboboxState());
  };

  const { mutateAsync: updateLedger } = useUpdateLedger();

  const form = useEditLedgerForm({
    ledger,
    onSubmit: async (payload) => {
      try {
        await updateLedger({ id: ledger.id, payload });
        toast.success('Ledger updated successfully', {
          position: 'bottom-right',
        });
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update ledger', {
          position: 'bottom-right',
        });
      }
    },
  });

  const sortedTypes = useMemo(
    () => filterAndSortOptions(typeCombobox.search, LEDGER_TYPE_OPTIONS),
    [typeCombobox.search],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialogState(form, ledger, resetComboboxState);
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
          <DialogTitle className="text-xl font-semibold tracking-tight">Edit Ledger</DialogTitle>
          <DialogDescription>
            Update the ledger name, classification, or balances.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-ledger-form"
          noValidate
          ref={portalContainerRef}
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-4">
            <form.Field name="name">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="edit-ledger-name">Name</FieldLabel>
                    <Input
                      id="edit-ledger-name"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="e.g. Cash A/c"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="type">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="edit-ledger-type">Type</FieldLabel>
                    <SearchableOptionCombobox
                      id="edit-ledger-type"
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value);
                        form.setFieldValue('subType', '');
                        form.setFieldValue('category', '');
                        setSubTypeCombobox(emptyComboboxState());
                        setCategoryCombobox(emptyComboboxState());
                      }}
                      onBlur={field.handleBlur}
                      isInvalid={isInvalid}
                      placeholder="Search types..."
                      emptyMessage="No types found."
                      options={LEDGER_TYPE_OPTIONS}
                      sortedOptions={sortedTypes}
                      search={typeCombobox.search}
                      setSearch={(search) => setTypeCombobox((current) => ({ ...current, search }))}
                      open={typeCombobox.open}
                      setOpen={(open) => setTypeCombobox((current) => ({ ...current, open }))}
                      portalContainer={portalContainerRef}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.type}>
              {(selectedType) => {
                const subTypeOptions = getSubTypeOptionsForType(selectedType);
                const sortedSubTypes = filterAndSortOptions(subTypeCombobox.search, subTypeOptions);

                return (
                  <form.Field name="subType">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="edit-ledger-sub-type">Sub type</FieldLabel>
                          <SearchableOptionCombobox
                            id="edit-ledger-sub-type"
                            name={field.name}
                            value={field.state.value}
                            onValueChange={(value) => {
                              field.handleChange(value);
                              form.setFieldValue('category', '');
                              setCategoryCombobox(emptyComboboxState());
                            }}
                            onBlur={field.handleBlur}
                            isInvalid={isInvalid}
                            placeholder={selectedType ? 'Search sub types...' : 'Select type first'}
                            emptyMessage={
                              selectedType ? 'No sub types found.' : 'Select a type first.'
                            }
                            options={subTypeOptions}
                            sortedOptions={sortedSubTypes}
                            search={subTypeCombobox.search}
                            setSearch={(search) =>
                              setSubTypeCombobox((current) => ({
                                ...current,
                                search,
                              }))
                            }
                            open={subTypeCombobox.open}
                            setOpen={(open) =>
                              setSubTypeCombobox((current) => ({
                                ...current,
                                open,
                              }))
                            }
                            portalContainer={portalContainerRef}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>
                );
              }}
            </form.Subscribe>

            <form.Subscribe
              selector={(state) => ({
                type: state.values.type,
                subType: state.values.subType,
              })}
            >
              {({ type, subType }) => {
                const categoryOptions = getCategoryOptionsForTypeSubType(type, subType);
                const sortedCategories = filterAndSortOptions(
                  categoryCombobox.search,
                  categoryOptions,
                );

                return (
                  <form.Field name="category">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="edit-ledger-category">Category</FieldLabel>
                          <SearchableOptionCombobox
                            id="edit-ledger-category"
                            name={field.name}
                            value={field.state.value}
                            onValueChange={field.handleChange}
                            onBlur={field.handleBlur}
                            isInvalid={isInvalid}
                            placeholder={
                              type && subType
                                ? 'Search categories...'
                                : 'Select type and sub type first'
                            }
                            emptyMessage={
                              type && subType
                                ? 'No categories found.'
                                : 'Select type and sub type first.'
                            }
                            options={categoryOptions}
                            sortedOptions={sortedCategories}
                            search={categoryCombobox.search}
                            setSearch={(search) =>
                              setCategoryCombobox((current) => ({
                                ...current,
                                search,
                              }))
                            }
                            open={categoryCombobox.open}
                            setOpen={(open) =>
                              setCategoryCombobox((current) => ({
                                ...current,
                                open,
                              }))
                            }
                            portalContainer={portalContainerRef}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>
                );
              }}
            </form.Subscribe>

            <form.Field name="openingBalance">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="edit-ledger-opening-balance">Opening balance</FieldLabel>
                    <FieldDescription>
                      Changing this recalculates balance from voucher history.
                    </FieldDescription>
                    <Input
                      id="edit-ledger-opening-balance"
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

            <form.Field name="closingBalance">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="edit-ledger-closing-balance">Closing balance</FieldLabel>
                    <FieldDescription>
                      Optional. Set directly for stock-style ledgers. Leave blank for none.
                    </FieldDescription>
                    <Input
                      id="edit-ledger-closing-balance"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Leave blank for none"
                      className="tabular-nums"
                      {...numericInputProps}
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
              <Button type="submit" form="edit-ledger-form" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
