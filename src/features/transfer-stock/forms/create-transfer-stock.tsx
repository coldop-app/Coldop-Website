import { useEffect, useMemo, useRef, useState } from 'react';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
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
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { DaybookBackButton } from '@/features/daybook/components/daybook-back-button';
import { TransferGatePassesSection } from '@/features/transfer-stock/forms/transfer-gate-passes-section';
import { TransferStockSummarySheet } from '@/features/transfer-stock/forms/transfer-stock-summary-sheet';
import { useCreateTransferStockForm } from '@/features/transfer-stock/forms/use-create-transfer-stock-form';
import { useCreateTransferStock } from '@/features/transfer-stock/api/use-create-transfer-stock';
import { useStorageGatePassesForFarmer } from '@/features/transfer-stock/hooks/use-storage-gate-passes-for-farmer';
import { createTransferStockFormSchema } from '@/features/transfer-stock/schemas/transfer-stock-form-schema';
import type { TransferStockFormValues } from '@/features/transfer-stock/schemas/transfer-stock-form-schema';
import { buildTransferItems } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { buildCreateTransferStockPayload } from '@/features/transfer-stock/utils/transfer-form-values-to-create-payload';
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
import { Input } from '@/components/ui/input';
import { DatePickerInput } from '@/components/date-picker';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import { useFarmerStorageLinks } from '@/features/people/api/use-farmer-storage-links';
import { getLinkDisplayName } from '@/features/people/utils/get-link-display-fields';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import {
  shouldShowCustomMarka,
  shouldShowStockFilter,
  toComboboxOptions,
} from '@/features/incoming/utils/incoming-preferences';

const transferRouteApi = getRouteApi('/_authenticated/transfer/');

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function TransferGatePassesStockFilterPrompt() {
  return (
    <Card size="sm" className="ring-border/60 py-0">
      <CardContent className="px-0 py-0">
        <Empty className="border-0 py-10">
          <EmptyHeader>
            <EmptyTitle>Select a stock filter</EmptyTitle>
            <EmptyDescription>
              Choose a stock filter above to view incoming gate passes for this transfer.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}

type TransferStockReviewSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromFarmerStorageLinkId: string;
  parsedData: TransferStockFormValues | null;
  getFarmerLabel: (farmerStorageLinkId: string) => string;
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  allocations: Record<string, number>;
};

function TransferStockReviewSheet({
  open,
  onOpenChange,
  fromFarmerStorageLinkId,
  parsedData,
  getFarmerLabel,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
  allocations,
}: TransferStockReviewSheetProps) {
  const { data: passes } = useStorageGatePassesForFarmer(fromFarmerStorageLinkId);
  const transferItems = parsedData ? buildTransferItems(allocations, passes) : [];

  return (
    <TransferStockSummarySheet
      open={open}
      onOpenChange={onOpenChange}
      values={parsedData}
      transferItems={transferItems}
      fromFarmerLabel={parsedData ? getFarmerLabel(parsedData.fromFarmerStorageLinkId) : ''}
      toFarmerLabel={parsedData ? getFarmerLabel(parsedData.toFarmerStorageLinkId) : ''}
      onBack={onBack}
      onSubmit={onSubmit}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

const CreateTransferStock = () => {
  const navigate = useNavigate();
  const { farmerLinkId, potatoAction } = transferRouteApi.useSearch();
  const prefillDoneRef = useRef(false);
  const { mutateAsync: createTransferStock } = useCreateTransferStock();
  const preferences = usePreferencesStore((state) => state.preferences);

  const showCustomMarka = shouldShowCustomMarka(preferences?.customMarka);
  const showStockFilter = shouldShowStockFilter(preferences?.stockFilter);

  const schemaConfig = useMemo(
    () => ({
      requireCustomMarka: showCustomMarka,
      requireStockFilter: showStockFilter,
    }),
    [showCustomMarka, showStockFilter],
  );

  const formSchema = useMemo(() => createTransferStockFormSchema(schemaConfig), [schemaConfig]);

  const stockFilterOptions = useMemo(
    () => toComboboxOptions(preferences?.stockFilter?.options ?? []),
    [preferences?.stockFilter?.options],
  );

  const {
    data: farmerStorageLinks,
    isLoading: isFarmersLoading,
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

  const [fromFarmerSearch, setFromFarmerSearch] = useState('');
  const [fromFarmerComboboxOpen, setFromFarmerComboboxOpen] = useState(false);
  const [toFarmerSearch, setToFarmerSearch] = useState('');
  const [toFarmerComboboxOpen, setToFarmerComboboxOpen] = useState(false);
  const [stockFilterSearch, setStockFilterSearch] = useState('');
  const [stockFilterComboboxOpen, setStockFilterComboboxOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const sortedFromFarmers = useMemo(
    () => filterAndSortOptions(fromFarmerSearch, farmerOptions),
    [fromFarmerSearch, farmerOptions],
  );
  const sortedToFarmers = useMemo(
    () => filterAndSortOptions(toFarmerSearch, farmerOptions),
    [toFarmerSearch, farmerOptions],
  );
  const sortedStockFilters = useMemo(
    () => filterAndSortOptions(stockFilterSearch, stockFilterOptions),
    [stockFilterSearch, stockFilterOptions],
  );

  const resetComboboxState = () => {
    setFromFarmerSearch('');
    setFromFarmerComboboxOpen(false);
    setToFarmerSearch('');
    setToFarmerComboboxOpen(false);
    setStockFilterSearch('');
    setStockFilterComboboxOpen(false);
  };

  const form = useCreateTransferStockForm({
    schemaConfig,
    onOpenReview: () => setReviewOpen(true),
    onSubmitConfirmed: async (values, items) => {
      try {
        let payloadOptions: Parameters<typeof buildCreateTransferStockPayload>[2];

        if (potatoAction && farmerLinkId) {
          const farmerLink = farmerStorageLinks.find((link) => link._id === farmerLinkId);
          const costPerBag = farmerLink?.costPerBag;

          if (!costPerBag || costPerBag <= 0) {
            toast.error(
              'Farmer has no valid cost per bag. Update the farmer account before submitting.',
              { position: 'bottom-right' },
            );
            throw new Error('Missing cost per bag for potato transfer.');
          }

          payloadOptions = {
            potatoAction,
            costPerBag,
          };
        }

        const payload = buildCreateTransferStockPayload(values, items, payloadOptions);
        const created = await createTransferStock(payload);

        toast.success(`Transfer #${created.gatePassNo.toLocaleString('en-IN')} created`, {
          position: 'bottom-right',
        });
        setReviewOpen(false);
        form.reset();
        resetComboboxState();
        navigate({ to: '/daybook', search: DEFAULT_DAYBOOK_SEARCH });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create transfer stock gate pass',
          { position: 'bottom-right' },
        );
        throw error;
      }
    },
  });

  useEffect(() => {
    if (prefillDoneRef.current || isFarmersLoading || !farmerLinkId || !potatoAction) {
      return;
    }

    const linkExists = farmerStorageLinks.some((link) => link._id === farmerLinkId);
    if (!linkExists) {
      return;
    }

    if (potatoAction === 'buy') {
      form.setFieldValue('fromFarmerStorageLinkId', farmerLinkId);
    } else {
      form.setFieldValue('toFarmerStorageLinkId', farmerLinkId);
    }

    prefillDoneRef.current = true;
  }, [farmerLinkId, potatoAction, isFarmersLoading, farmerStorageLinks, form]);

  const getFarmerLabel = (farmerStorageLinkId: string) =>
    farmerOptions.find((option) => option.id === farmerStorageLinkId)?.label ?? farmerStorageLinkId;

  const farmerComboboxDisabled = isFarmersLoading || isFarmersError;
  const farmerComboboxPlaceholder = isFarmersLoading ? 'Loading farmers...' : 'Search farmers...';

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: 'review' });
  };

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: 'submit' });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <DaybookBackButton />
      {potatoAction ? (
        <div className="border-border bg-muted/30 text-muted-foreground rounded-lg border px-4 py-3 text-sm">
          Transfer stock for {potatoAction === 'buy' ? 'Buy Potato' : 'Sell Potato'}
        </div>
      ) : null}
      <Card className="w-full shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-6">
          <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Transfer Stock
          </CardTitle>
          <CardDescription className="text-base">
            Move stock between farmer storage accounts.
          </CardDescription>
        </CardHeader>

        <form id="create-transfer-stock-form" noValidate onSubmit={(e) => e.preventDefault()}>
          <CardContent className="pt-8 pb-8">
            <FieldGroup className="@container/field-group gap-10">
              <FieldSet>
                <FieldLegend className="font-heading text-base font-semibold">
                  Transfer details
                </FieldLegend>
                <FieldDescription>
                  Select source and destination accounts, then the transfer date.
                </FieldDescription>
                <FieldGroup className="mt-5 grid grid-cols-1 gap-6">
                  <form.Field name="fromFarmerStorageLinkId">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="transfer-stock-from-farmer">From</FieldLabel>
                          <SearchableOptionCombobox
                            id="transfer-stock-from-farmer"
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
                            disabled={farmerComboboxDisabled}
                            placeholder={farmerComboboxPlaceholder}
                            emptyMessage="No farmers found."
                            options={farmerOptions}
                            sortedOptions={sortedFromFarmers}
                            search={fromFarmerSearch}
                            setSearch={setFromFarmerSearch}
                            open={fromFarmerComboboxOpen}
                            setOpen={setFromFarmerComboboxOpen}
                          />
                          {isFarmersError && (
                            <FieldDescription className="text-destructive">
                              {farmersError instanceof Error
                                ? farmersError.message
                                : 'Something went wrong while fetching farmers.'}
                            </FieldDescription>
                          )}
                          <FieldDescription>
                            Farmer account stock is transferred from.
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
                            <FieldLabel htmlFor="transfer-stock-stock-filter">
                              Stock filter
                            </FieldLabel>
                            <SearchableOptionCombobox
                              id="transfer-stock-stock-filter"
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

                  <form.Field name="toFarmerStorageLinkId">
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="transfer-stock-to-farmer">To</FieldLabel>
                          <SearchableOptionCombobox
                            id="transfer-stock-to-farmer"
                            name={field.name}
                            value={field.state.value}
                            onValueChange={field.handleChange}
                            onBlur={field.handleBlur}
                            isInvalid={isInvalid}
                            disabled={farmerComboboxDisabled}
                            placeholder={farmerComboboxPlaceholder}
                            emptyMessage="No farmers found."
                            options={farmerOptions}
                            sortedOptions={sortedToFarmers}
                            search={toFarmerSearch}
                            setSearch={setToFarmerSearch}
                            open={toFarmerComboboxOpen}
                            setOpen={setToFarmerComboboxOpen}
                          />
                          {isFarmersError && (
                            <FieldDescription className="text-destructive">
                              {farmersError instanceof Error
                                ? farmersError.message
                                : 'Something went wrong while fetching farmers.'}
                            </FieldDescription>
                          )}
                          <FieldDescription>
                            Farmer account receiving the transferred stock.
                          </FieldDescription>
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>

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

                  {showCustomMarka ? (
                    <form.Field
                      name="customMarka"
                      validators={{ onChange: formSchema.shape.customMarka }}
                    >
                      {(field) => {
                        const isInvalid = isFieldInvalid(field.state.meta);
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor="transfer-stock-custom-marka">
                              Custom marka
                            </FieldLabel>
                            <Input
                              id="transfer-stock-custom-marka"
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              aria-invalid={isInvalid}
                              placeholder="Enter marka identifier"
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        );
                      }}
                    </form.Field>
                  ) : null}
                </FieldGroup>
              </FieldSet>

              <form.Subscribe
                selector={(state) => ({
                  fromFarmerStorageLinkId: state.values.fromFarmerStorageLinkId,
                  stockFilter: state.values.stockFilter,
                })}
                children={({ fromFarmerStorageLinkId, stockFilter }) => {
                  const canShowGatePasses = !showStockFilter || stockFilter.trim().length > 0;

                  return (
                    <FieldSet>
                      <FieldLegend className="font-heading text-base font-semibold">
                        Incoming gate pass
                      </FieldLegend>
                      <FieldDescription>
                        Select vouchers and quantities to transfer from the source account.
                      </FieldDescription>
                      <div className="mt-5">
                        {!canShowGatePasses ? (
                          <TransferGatePassesStockFilterPrompt />
                        ) : (
                          <form.Field name="allocations">
                            {(allocField) => (
                              <TransferGatePassesSection
                                key={`${fromFarmerStorageLinkId || 'no-farmer'}-${stockFilter}`}
                                fromFarmerStorageLinkId={fromFarmerStorageLinkId}
                                allocations={allocField.state.value}
                                onAllocationsChange={allocField.handleChange}
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
                            className="min-h-[120px] resize-y text-base"
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
                <Button type="button" disabled={isSubmitting} onClick={handleOpenReview}>
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

            return (
              <TransferStockReviewSheet
                open={reviewOpen}
                onOpenChange={setReviewOpen}
                fromFarmerStorageLinkId={values.fromFarmerStorageLinkId}
                parsedData={parsed.success ? parsed.data : null}
                getFarmerLabel={getFarmerLabel}
                onBack={() => setReviewOpen(false)}
                onSubmit={handleConfirmSubmit}
                canSubmit={canSubmit}
                isSubmitting={isSubmitting}
                allocations={values.allocations}
              />
            );
          }}
        />
      </Card>
    </div>
  );
};

export default CreateTransferStock;
