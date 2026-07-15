import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { DaybookBackButton } from '@/features/daybook/components/daybook-back-button';
import {
  shouldShowStockFilter,
  toComboboxOptions,
} from '@/features/incoming/utils/incoming-preferences';
import { OutgoingSummarySheet } from '@/features/outgoing/forms/outgoing-summary-sheet';
import { useCreateOutgoingForm } from '@/features/outgoing/forms/use-create-outgoing-form';
import type { OutgoingFormValues } from '@/features/outgoing/schemas/outgoing-form-schema';
import { buildCreateOutgoingGatePassPayload } from '@/features/outgoing/utils/outgoing-form-values-to-create-payload';
import { useCreateOutgoingGatePass } from '@/features/outgoing/api/use-create-outgoing-gate-pass';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import { useFarmerStorageLinks } from '@/features/people/api/use-farmer-storage-links';
import { getLinkDisplayName } from '@/features/people/utils/get-link-display-fields';
import { TransferGatePassesSection } from '@/features/transfer-stock/forms/transfer-gate-passes-section';
import { useStorageGatePassesForFarmer } from '@/features/transfer-stock/hooks/use-storage-gate-passes-for-farmer';
import { buildTransferItems } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerInput } from '@/components/date-picker';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import {
  numericInputProps,
  normalizeUppercase,
  parseOptionalNumber,
  TRUCK_NUMBER_MAX_LENGTH,
} from '@/lib/form-utils';

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function OutgoingGatePassesStockFilterPrompt() {
  return (
    <Card size="sm" className="ring-border/60 py-0">
      <CardContent className="px-0 py-0">
        <Empty className="border-0 py-10">
          <EmptyHeader>
            <EmptyTitle>Select a stock filter</EmptyTitle>
            <EmptyDescription>
              Choose a stock filter above to view incoming gate passes for this outgoing pass.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}

type OutgoingReviewSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerStorageLinkId: string;
  values: OutgoingFormValues | null;
  farmerLabel: string;
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
};

function OutgoingReviewSheet({
  open,
  onOpenChange,
  farmerStorageLinkId,
  values,
  farmerLabel,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: OutgoingReviewSheetProps) {
  const { data: passes = [] } = useStorageGatePassesForFarmer(farmerStorageLinkId);
  const outgoingItems = values != null ? buildTransferItems(values.allocations, passes) : [];

  return (
    <OutgoingSummarySheet
      open={open}
      onOpenChange={onOpenChange}
      values={values}
      farmerLabel={farmerLabel}
      outgoingItems={outgoingItems}
      passes={passes}
      onBack={onBack}
      onSubmit={onSubmit}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

const CreateOutgoingForm = () => {
  const navigate = useNavigate();
  const { mutateAsync: createOutgoingGatePass } = useCreateOutgoingGatePass();
  const preferences = usePreferencesStore((state) => state.preferences);
  const showStockFilter = shouldShowStockFilter(preferences?.stockFilter);

  const schemaConfig = useMemo(() => ({ requireStockFilter: showStockFilter }), [showStockFilter]);

  const stockFilterOptions = useMemo(
    () => toComboboxOptions(preferences?.stockFilter?.options ?? []),
    [preferences?.stockFilter?.options],
  );

  const [stockFilterSearch, setStockFilterSearch] = useState('');
  const [stockFilterComboboxOpen, setStockFilterComboboxOpen] = useState(false);

  const sortedStockFilters = useMemo(
    () => filterAndSortOptions(stockFilterSearch, stockFilterOptions),
    [stockFilterSearch, stockFilterOptions],
  );

  const {
    data: farmerStorageLinks = [],
    isLoading: isLoadingFarmers,
    isError: isFarmersError,
    error: farmersError,
  } = useFarmerStorageLinks();

  const farmerOptions = useMemo<ComboboxOption[]>(
    () =>
      farmerStorageLinks.map((link) => ({
        id: link._id,
        label: `${getLinkDisplayName(link)} — Acct #${link.accountNumber}`,
      })),
    [farmerStorageLinks],
  );

  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const sortedFarmers = useMemo(
    () => filterAndSortOptions(farmerSearch, farmerOptions),
    [farmerSearch, farmerOptions],
  );

  function resetComboboxState() {
    setFarmerSearch('');
    setFarmerComboboxOpen(false);
    setStockFilterSearch('');
    setStockFilterComboboxOpen(false);
  }

  const {
    form,
    formSchema,
    nextVoucherNumber,
    isLoadingVoucherNumber,
    isVoucherNumberError,
    isGatePassNumberReady,
  } = useCreateOutgoingForm({
    schemaConfig,
    onOpenReview: () => setReviewOpen(true),
    onCloseReview: () => setReviewOpen(false),
    onSubmitConfirmed: async (values, items, passes) => {
      if (nextVoucherNumber == null) {
        throw new Error('Gate pass number is not ready.');
      }

      try {
        const payload = buildCreateOutgoingGatePassPayload(
          values,
          items,
          passes,
          nextVoucherNumber,
          crypto.randomUUID(),
        );
        const created = await createOutgoingGatePass(payload);

        toast.success(`Outgoing #${created.gatePassNo.toLocaleString('en-IN')} created`, {
          position: 'bottom-right',
        });
        setReviewOpen(false);
        form.reset();
        resetComboboxState();
        navigate({ to: '/daybook', search: DEFAULT_DAYBOOK_SEARCH });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create outgoing gate pass',
          { position: 'bottom-right' },
        );
        throw error;
      }
    },
  });

  const displayGatePassNo = isLoadingVoucherNumber
    ? '…'
    : isVoucherNumberError
      ? '—'
      : (nextVoucherNumber ?? '—');

  const getFarmerLabel = (farmerStorageLinkId: string) =>
    farmerOptions.find((option) => option.id === farmerStorageLinkId)?.label ?? farmerStorageLinkId;

  const farmerComboboxDisabled = isLoadingFarmers || isFarmersError;

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: 'review' });
  };

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: 'submit' });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-4">
      <DaybookBackButton />
      <Card className="w-full min-w-0 overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-6">
          <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Outgoing{' '}
            <span className="text-primary font-mono text-xl tabular-nums sm:text-2xl">
              #{displayGatePassNo}
            </span>
          </CardTitle>
          <CardDescription className="text-base">
            Record stock leaving storage for a farmer account.
          </CardDescription>
        </CardHeader>

        <form id="create-outgoing-form" noValidate onSubmit={(e) => e.preventDefault()}>
          <CardContent className="min-w-0 px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8">
            <FieldGroup className="@container/field-group min-w-0 gap-10">
              <FieldSet>
                <FieldLegend className="font-heading text-base font-semibold">
                  Outgoing details
                </FieldLegend>
                <FieldDescription>Select the farmer account and outgoing date.</FieldDescription>
                <FieldGroup className="mt-5 grid grid-cols-1 gap-6">
                  <form.Field name="farmerStorageLinkId">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="outgoing-farmer">Farmer</FieldLabel>
                          <SearchableOptionCombobox
                            id="outgoing-farmer"
                            name={field.name}
                            value={field.state.value}
                            onValueChange={(value) => {
                              field.handleChange(value);
                              form.setFieldValue('allocations', {});
                              form.setFieldValue('stockFilter', '');
                              setStockFilterSearch('');
                              setStockFilterComboboxOpen(false);
                            }}
                            onBlur={field.handleBlur}
                            isInvalid={isInvalid}
                            placeholder={isLoadingFarmers ? 'Loading farmers…' : 'Search farmers…'}
                            emptyMessage={
                              isLoadingFarmers ? 'Loading farmers…' : 'No farmers found.'
                            }
                            options={farmerOptions}
                            sortedOptions={sortedFarmers}
                            search={farmerSearch}
                            setSearch={setFarmerSearch}
                            open={farmerComboboxOpen}
                            setOpen={setFarmerComboboxOpen}
                            disabled={farmerComboboxDisabled}
                          />
                          {isFarmersError && (
                            <FieldDescription className="text-destructive">
                              {farmersError instanceof Error
                                ? farmersError.message
                                : 'Something went wrong while fetching farmers.'}
                            </FieldDescription>
                          )}
                          <FieldDescription>
                            Farmer account stock is outgoing from.
                          </FieldDescription>
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>

                  {showStockFilter ? (
                    <form.Field
                      name="stockFilter"
                      validators={{ onChange: formSchema.shape.stockFilter }}
                    >
                      {(field) => {
                        const isInvalid = isFieldInvalid(field.state.meta);
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor="outgoing-stock-filter">Stock filter</FieldLabel>
                            <SearchableOptionCombobox
                              id="outgoing-stock-filter"
                              name={field.name}
                              value={field.state.value}
                              onValueChange={(value) => {
                                field.handleChange(value);
                                form.setFieldValue('allocations', {});
                              }}
                              onBlur={field.handleBlur}
                              isInvalid={isInvalid}
                              placeholder="Search stock filters..."
                              emptyMessage="No stock filters found."
                              options={stockFilterOptions}
                              sortedOptions={sortedStockFilters}
                              search={stockFilterSearch}
                              setSearch={setStockFilterSearch}
                              open={stockFilterComboboxOpen}
                              setOpen={setStockFilterComboboxOpen}
                            />
                            <FieldDescription>
                              Required before selecting incoming gate passes.
                            </FieldDescription>
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        );
                      }}
                    </form.Field>
                  ) : null}

                  <form.Field name="date">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid} className="@md/field-group:max-w-sm">
                          <DatePickerInput
                            id={field.name}
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

                  <form.Field name="manualGatePassNumber">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid} className="@md/field-group:max-w-sm">
                          <FieldLabel htmlFor={field.name}>Manual gate pass no.</FieldLabel>
                          <Input
                            {...numericInputProps}
                            id={field.name}
                            name={field.name}
                            value={field.state.value != null ? String(field.state.value) : ''}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(parseOptionalNumber(e.target.value))
                            }
                            inputMode="numeric"
                            placeholder="Optional"
                            aria-invalid={isInvalid}
                            className="tabular-nums"
                          />
                          <FieldDescription>
                            Optional reference number if used on the physical pass.
                          </FieldDescription>
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>
                </FieldGroup>
              </FieldSet>

              <FieldSet>
                <FieldLegend className="font-heading text-base font-semibold">
                  Route &amp; vehicle
                </FieldLegend>
                <FieldDescription>
                  Optional source, destination, and truck for this dispatch.
                </FieldDescription>
                <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-3">
                  <form.Field name="from">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>From</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Optional"
                            autoComplete="off"
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Field name="to">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>To</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Optional"
                            autoComplete="off"
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Field name="truckNumber">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Truck number</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(normalizeUppercase(e.target.value))}
                            placeholder="Optional"
                            autoComplete="off"
                            aria-invalid={isInvalid}
                            className="uppercase"
                            maxLength={TRUCK_NUMBER_MAX_LENGTH}
                          />
                          <FieldDescription>
                            Optional vehicle registration for this dispatch.
                          </FieldDescription>
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>
                </FieldGroup>
              </FieldSet>

              <form.Subscribe
                selector={(state) => ({
                  farmerStorageLinkId: state.values.farmerStorageLinkId,
                  stockFilter: state.values.stockFilter,
                })}
                children={({ farmerStorageLinkId, stockFilter }) => {
                  const canShowGatePasses = !showStockFilter || stockFilter.trim().length > 0;

                  return (
                    <FieldSet className="min-w-0">
                      <FieldLegend className="font-heading text-base font-semibold">
                        Incoming gate pass
                      </FieldLegend>
                      <FieldDescription>
                        Select vouchers and quantities to mark as outgoing.
                      </FieldDescription>
                      <div className="mt-5 min-w-0">
                        {!canShowGatePasses ? (
                          <OutgoingGatePassesStockFilterPrompt />
                        ) : (
                          <form.Field name="allocations">
                            {(allocField) => (
                              <TransferGatePassesSection
                                key={`${farmerStorageLinkId || 'no-farmer'}-${stockFilter}`}
                                varietyFilterMode="multi-optional"
                                fromFarmerStorageLinkId={farmerStorageLinkId}
                                allocations={allocField.state.value}
                                onAllocationsChange={allocField.handleChange}
                                farmerPromptLabel="farmer"
                                stockFilter={showStockFilter ? stockFilter : undefined}
                              />
                            )}
                          </form.Field>
                        )}
                      </div>
                    </FieldSet>
                  );
                }}
              />

              <FieldSet>
                <FieldLegend className="font-heading text-base font-semibold">
                  Additional notes
                </FieldLegend>
                <FieldGroup className="mt-5">
                  <form.Field name="remarks">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name} className="sr-only">
                            Remarks
                          </FieldLabel>
                          <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Add any additional comments or observations (optional)"
                            className="min-h-[120px] resize-y"
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </CardContent>

          <CardFooter className="bg-muted/30 justify-end gap-3 border-t py-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                form.reset();
                resetComboboxState();
              }}
            >
              Reset form
            </Button>
            <form.Subscribe
              selector={(state) => state.isSubmitting}
              children={(isSubmitting) => (
                <Button
                  type="button"
                  disabled={isSubmitting || !isGatePassNumberReady}
                  onClick={handleOpenReview}
                >
                  {isSubmitting ? 'Validating…' : 'Review'}
                </Button>
              )}
            />
          </CardFooter>
        </form>

        <form.Subscribe
          selector={(state) => ({
            values: state.values,
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
          children={({ values, canSubmit, isSubmitting }) => {
            const parsed = formSchema.safeParse(values);
            const farmerId = parsed.success
              ? parsed.data.farmerStorageLinkId
              : values.farmerStorageLinkId;

            return (
              <OutgoingReviewSheet
                open={reviewOpen}
                onOpenChange={setReviewOpen}
                farmerStorageLinkId={farmerId}
                values={parsed.success ? parsed.data : null}
                farmerLabel={parsed.success ? getFarmerLabel(parsed.data.farmerStorageLinkId) : ''}
                onBack={() => setReviewOpen(false)}
                onSubmit={handleConfirmSubmit}
                canSubmit={canSubmit}
                isSubmitting={isSubmitting}
              />
            );
          }}
        />
      </Card>
    </div>
  );
};

export default CreateOutgoingForm;
