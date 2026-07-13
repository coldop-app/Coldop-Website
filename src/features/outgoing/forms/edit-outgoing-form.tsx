import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import { DatePickerInput } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { DaybookBackButton } from '@/features/daybook/components/daybook-back-button';
import type { OutgoingDaybookEntry } from '@/features/daybook/types';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import { resolveFarmerStorageLinkId } from '@/features/daybook/utils/resolve-farmer-storage-link-id';
import {
  shouldShowStockFilter,
  toComboboxOptions,
} from '@/features/incoming/utils/incoming-preferences';
import { useOutgoingDaybookEntry } from '@/features/outgoing/api/use-outgoing-daybook-entry';
import { useFarmerStorageLinks } from '@/features/people/api/use-farmer-storage-links';
import { useUpdateOutgoingGatePass } from '@/features/outgoing/api/use-update-outgoing-gate-pass';
import { OutgoingSummarySheet } from '@/features/outgoing/forms/outgoing-summary-sheet';
import { useEditOutgoingGatePassForm } from '@/features/outgoing/forms/use-edit-outgoing-gate-pass';
import type { OutgoingEditFormValues } from '@/features/outgoing/schemas/outgoing-edit-form-schema';
import { outgoingDaybookEntryToAllocations } from '@/features/outgoing/utils/outgoing-daybook-entry-to-allocations';
import { outgoingDaybookEntryToEditFormValues } from '@/features/outgoing/utils/outgoing-daybook-entry-to-edit-form-values';
import { mergeOutgoingSnapshotPasses } from '@/features/outgoing/utils/merge-outgoing-snapshot-passes';
import { buildUpdateOutgoingGatePassPayload } from '@/features/outgoing/utils/outgoing-form-values-to-update-payload';
import { TransferGatePassesSection } from '@/features/transfer-stock/forms/transfer-gate-passes-section';
import { useStorageGatePassesForFarmer } from '@/features/transfer-stock/hooks/use-storage-gate-passes-for-farmer';
import { buildTransferItems } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';
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
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
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

function EditOutgoingFormLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <DaybookBackButton />
      {children}
    </div>
  );
}

type EditOutgoingFormLoadedProps = {
  entry: OutgoingDaybookEntry;
  gatePassId: string;
  defaultValues: OutgoingEditFormValues;
  baselineValues: OutgoingEditFormValues;
  baselineAllocations: Record<string, number>;
  farmerLabel: string;
  storagePasses: StorageGatePass[];
};

function EditOutgoingFormLoaded({
  entry,
  gatePassId,
  defaultValues,
  baselineValues,
  baselineAllocations,
  farmerLabel,
  storagePasses,
}: EditOutgoingFormLoadedProps) {
  const navigate = useNavigate();
  const [reviewOpen, setReviewOpen] = useState(false);
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

  const { mutateAsync: updateOutgoingGatePass, isPending: isSaving } = useUpdateOutgoingGatePass();

  const { form, formSchema } = useEditOutgoingGatePassForm({
    schemaConfig,
    defaultValues,
    resolveStoragePasses: () => storagePasses,
    onOpenReview: () => setReviewOpen(true),
    onCloseReview: () => setReviewOpen(false),
    onSubmitConfirmed: async (values, items, passes) => {
      const payload = buildUpdateOutgoingGatePassPayload(values, baselineValues, items, passes);

      if (!payload) {
        toast.info('No changes to save', { position: 'bottom-right' });
        return;
      }

      try {
        await updateOutgoingGatePass({ id: gatePassId, payload });
        toast.success(`Outgoing #${entry.gatePassNo.toLocaleString('en-IN')} updated`, {
          position: 'bottom-right',
        });
        setReviewOpen(false);
        navigate({ to: '/daybook', search: DEFAULT_DAYBOOK_SEARCH });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to update outgoing gate pass',
          { position: 'bottom-right' },
        );
        throw error;
      }
    },
  });

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: 'review' });
  };

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: 'submit' });
  };

  const farmerStorageLinkId = defaultValues.farmerStorageLinkId;

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="bg-muted/30 border-b pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Edit outgoing{' '}
          <span className="text-primary font-mono text-xl tabular-nums sm:text-2xl">
            #{entry.gatePassNo.toLocaleString('en-IN')}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Update allocations, route details, and remarks for this gate pass.
        </CardDescription>
      </CardHeader>

      <form id={`edit-outgoing-form-${gatePassId}`} noValidate onSubmit={(e) => e.preventDefault()}>
        <CardContent className="pt-8 pb-8">
          <FieldGroup className="@container/field-group gap-10">
            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">Account</FieldLegend>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6">
                <Field>
                  <FieldLabel>Farmer</FieldLabel>
                  <Input value={farmerLabel} readOnly disabled />
                  <FieldDescription>
                    Farmer account cannot be changed on an existing outgoing pass.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Outgoing details
              </FieldLegend>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6">
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

                {showStockFilter ? (
                  <form.Field
                    name="stockFilter"
                    validators={{ onChange: formSchema.shape.stockFilter }}
                  >
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="edit-outgoing-stock-filter">Stock filter</FieldLabel>
                          <SearchableOptionCombobox
                            id="edit-outgoing-stock-filter"
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
                          onChange={(e) => field.handleChange(parseOptionalNumber(e.target.value))}
                          inputMode="numeric"
                          placeholder="Optional"
                          aria-invalid={isInvalid}
                          className="tabular-nums"
                        />
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
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-3">
                <form.Field name="from">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>From</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Optional"
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
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Optional"
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
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(normalizeUppercase(e.target.value))}
                          placeholder="Optional"
                          aria-invalid={isInvalid}
                          className="uppercase"
                          maxLength={TRUCK_NUMBER_MAX_LENGTH}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <form.Subscribe
              selector={(state) => state.values.stockFilter}
              children={(stockFilter) => {
                const canShowGatePasses = !showStockFilter || stockFilter.trim().length > 0;

                return (
                  <FieldSet>
                    <FieldLegend className="font-heading text-base font-semibold">
                      Incoming gate pass
                    </FieldLegend>
                    <FieldDescription>
                      Adjust vouchers and quantities for this outgoing pass.
                    </FieldDescription>
                    <div className="mt-5">
                      {!canShowGatePasses ? (
                        <OutgoingGatePassesStockFilterPrompt />
                      ) : (
                        <form.Field name="allocations">
                          {(allocField) => (
                            <TransferGatePassesSection
                              key={`${farmerStorageLinkId}-${stockFilter}`}
                              varietyFilterMode="multi-optional"
                              allocationMode="edit"
                              baselineAllocations={baselineAllocations}
                              fromFarmerStorageLinkId={farmerStorageLinkId}
                              allocations={allocField.state.value}
                              onAllocationsChange={allocField.handleChange}
                              farmerPromptLabel="farmer"
                              passesOverride={storagePasses}
                              passesLoading={false}
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
          <Button variant="outline" type="button" onClick={() => form.reset(defaultValues)}>
            Reset changes
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button type="button" disabled={isSubmitting || isSaving} onClick={handleOpenReview}>
                {isSubmitting ? 'Validating…' : 'Review changes'}
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
            <EditOutgoingReviewSheet
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              farmerStorageLinkId={farmerId}
              values={parsed.success ? parsed.data : null}
              farmerLabel={farmerLabel}
              onBack={() => setReviewOpen(false)}
              onSubmit={handleConfirmSubmit}
              canSubmit={canSubmit}
              isSubmitting={isSubmitting || isSaving}
            />
          );
        }}
      />
    </Card>
  );
}

function EditOutgoingReviewSheet({
  open,
  onOpenChange,
  farmerStorageLinkId,
  values,
  farmerLabel,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerStorageLinkId: string;
  values: OutgoingEditFormValues | null;
  farmerLabel: string;
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
}) {
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
      confirmLabel="Confirm & save"
    />
  );
}

type EditOutgoingFormProps = {
  gatePassId: string;
};

const EditOutgoingForm = ({ gatePassId }: EditOutgoingFormProps) => {
  const entry = useOutgoingDaybookEntry(gatePassId);
  const { data: farmerStorageLinks = [], isLoading: isFarmersLoading } = useFarmerStorageLinks();

  const farmerStorageLinkId = useMemo(() => {
    if (!entry) return '';
    return resolveFarmerStorageLinkId(entry.farmerStorageLinkId, farmerStorageLinks);
  }, [entry, farmerStorageLinks]);

  const { data: passes = [], isLoading: isLoadingPasses } =
    useStorageGatePassesForFarmer(farmerStorageLinkId);

  const accountNumber = useMemo(() => {
    const matchedLink = farmerStorageLinks.find((link) => link._id === farmerStorageLinkId);
    if (matchedLink) return matchedLink.accountNumber;
    return entry?.farmerStorageLinkId.accountNumber ?? 0;
  }, [entry, farmerStorageLinkId, farmerStorageLinks]);

  const mergedPasses = useMemo(() => {
    if (!entry || !farmerStorageLinkId) return [];
    return mergeOutgoingSnapshotPasses(
      passes,
      entry.incomingGatePassSnapshots ?? [],
      farmerStorageLinkId,
      accountNumber,
    );
  }, [passes, entry, farmerStorageLinkId, accountNumber]);

  const mapped = useMemo(() => {
    if (!entry || isFarmersLoading || !farmerStorageLinkId || isLoadingPasses) {
      return null;
    }

    const { allocations, baselineAllocations } = outgoingDaybookEntryToAllocations(
      entry,
      mergedPasses,
    );
    const values = outgoingDaybookEntryToEditFormValues(entry, allocations, farmerStorageLinks);
    const matchedLink = farmerStorageLinks.find((link) => link._id === farmerStorageLinkId);
    const link = entry.farmerStorageLinkId;
    const farmerLabel = matchedLink
      ? `${matchedLink.name} — Acct #${matchedLink.accountNumber}`
      : `${link.name} — Acct #${link.accountNumber}`;

    return {
      values: {
        ...values,
        allocations: { ...allocations },
      },
      baselineValues: {
        ...values,
        allocations: { ...allocations },
      },
      baselineAllocations,
      farmerLabel,
      storagePasses: mergedPasses,
    };
  }, [
    entry,
    farmerStorageLinkId,
    farmerStorageLinks,
    isFarmersLoading,
    isLoadingPasses,
    mergedPasses,
  ]);

  if (!entry) {
    return (
      <EditOutgoingFormLayout>
        <Card className="w-full shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <CardTitle className="font-heading text-xl font-semibold tracking-tight">
              Gate pass not found
            </CardTitle>
            <CardDescription>
              This outgoing gate pass is not in the daybook cache. Open it from the daybook or
              search results first.
            </CardDescription>
          </CardHeader>
        </Card>
      </EditOutgoingFormLayout>
    );
  }

  if (entry.isNull) {
    return (
      <EditOutgoingFormLayout>
        <Card className="w-full shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <CardTitle className="font-heading text-xl font-semibold tracking-tight">
              Cannot edit null gate pass
            </CardTitle>
            <CardDescription>
              Outgoing gate pass #{entry.gatePassNo.toLocaleString('en-IN')} has been marked as
              null.
            </CardDescription>
          </CardHeader>
        </Card>
      </EditOutgoingFormLayout>
    );
  }

  if (!farmerStorageLinkId && !isFarmersLoading) {
    return (
      <EditOutgoingFormLayout>
        <Card className="w-full shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <CardTitle className="font-heading text-xl font-semibold tracking-tight">
              Farmer account unavailable
            </CardTitle>
            <CardDescription>
              Could not resolve the farmer storage link for this outgoing pass.
            </CardDescription>
          </CardHeader>
        </Card>
      </EditOutgoingFormLayout>
    );
  }

  if (!mapped) {
    return (
      <EditOutgoingFormLayout>
        <Card className="w-full shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-4 pt-8 pb-8">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </EditOutgoingFormLayout>
    );
  }

  return (
    <EditOutgoingFormLayout>
      <EditOutgoingFormLoaded
        key={gatePassId}
        entry={entry}
        gatePassId={gatePassId}
        defaultValues={mapped.values}
        baselineValues={mapped.baselineValues}
        baselineAllocations={mapped.baselineAllocations}
        farmerLabel={mapped.farmerLabel}
        storagePasses={mapped.storagePasses}
      />
    </EditOutgoingFormLayout>
  );
};

export default EditOutgoingForm;
