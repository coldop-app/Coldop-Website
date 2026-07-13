import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { UserPlus } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { IncomingQuantitiesSection } from '@/features/incoming/forms/incoming-quantities-section';
import { IncomingSummarySheet } from '@/features/incoming/forms/incoming-summary-sheet';
import { useIncomingForm } from '@/features/incoming/forms/use-incoming-form';
import {
  createDefaultIncomingQuantities,
  createIncomingFormSchema,
} from '@/features/incoming/schemas/incoming-form-schema';
import type { IncomingFormValues } from '@/features/incoming/types';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerInput } from '@/components/date-picker';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { useStoreAdminStore } from '@/features/auth/store/use-store-admin-store';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import { useCreateIncomingGatePass } from '@/features/incoming/api/use-create-incoming-gate-pass';
import { useUpdateIncomingGatePass } from '@/features/incoming/api/use-update-incoming-gate-pass';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import {
  buildIncomingFormSchemaConfig,
  createQuantitiesForSizes,
  getBagSizesForCommodity,
  getCommodityByName,
  getDefaultCommodityName,
  shouldShowCommoditySelect,
  shouldShowCustomMarka,
  shouldShowStockFilter,
  toComboboxOptions,
} from '@/features/incoming/utils/incoming-preferences';
import { buildCreateIncomingGatePassPayload } from '@/features/incoming/utils/incoming-form-values-to-create-payload';
import { buildUpdateIncomingGatePassPayload } from '@/features/incoming/utils/incoming-form-values-to-update-payload';
import type { IncomingBagSize } from '@/features/daybook/types';
import { AddFarmerDialog } from '@/features/people/components/add-farmer-dialog';
import type { FarmerStorageLink } from '@/features/people/types';
import { getLinkDisplayName } from '@/features/people/utils/get-link-display-fields';
import {
  numericInputProps,
  normalizeUppercase,
  parseOptionalNumber,
  TRUCK_NUMBER_MAX_LENGTH,
} from '@/lib/form-utils';

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

export type IncomingFormProps = {
  mode: 'create' | 'edit';
  gatePassNo: number;
  gatePassNoReady: boolean;
  userId: string;
  gatePassNoLoading?: boolean;
  gatePassNoError?: unknown;
  onRefetchGatePassNo?: () => void;
  initialCommodity?: string;
  initialBagSizes?: string[];
  editDefaultValues?: IncomingFormValues;
  initialSelectedCommodity?: string;
  initialFarmerSearch?: string;
  farmerStorageLinks: FarmerStorageLink[];
  isFarmersLoading: boolean;
  isFarmersError: boolean;
  farmersError: unknown;
  farmerLinkWarning?: string;
  gatePassId?: string;
  editBaselineValues?: IncomingFormValues;
  originalBagSizes?: IncomingBagSize[];
  rentEntryVoucherId?: string;
};

export function IncomingForm({
  mode,
  gatePassNo,
  gatePassNoReady,
  userId,
  gatePassNoLoading = false,
  gatePassNoError,
  onRefetchGatePassNo,
  initialCommodity = '',
  initialBagSizes = [],
  editDefaultValues,
  initialSelectedCommodity = '',
  initialFarmerSearch = '',
  farmerStorageLinks,
  isFarmersLoading,
  isFarmersError,
  farmersError,
  farmerLinkWarning,
  gatePassId,
  editBaselineValues,
  originalBagSizes = [],
  rentEntryVoucherId,
}: IncomingFormProps) {
  const [todayIso] = useState(() => new Date().toISOString());
  const preferences = usePreferencesStore((s) => s.preferences);
  const commodities = useMemo(() => preferences?.commodities ?? [], [preferences?.commodities]);

  const defaultCommodityName = useMemo(() => getDefaultCommodityName(commodities), [commodities]);

  const [selectedCommodityName, setSelectedCommodityName] = useState(initialSelectedCommodity);

  const resolvedCommodityName = selectedCommodityName || defaultCommodityName;

  const schemaConfig = useMemo(
    () => buildIncomingFormSchemaConfig(preferences, resolvedCommodityName),
    [preferences, resolvedCommodityName],
  );

  const formSchema = useMemo(() => createIncomingFormSchema(schemaConfig), [schemaConfig]);

  const createDefaultValues = useMemo(
    (): IncomingFormValues => ({
      gatePassNo,
      manualGatePassNumber: undefined,
      farmerIncomingLinkId: '',
      createdBy: userId,
      commodity: initialCommodity,
      variety: '',
      stockFilter: '',
      customMarka: '',
      date: todayIso,
      truckNumber: '',
      quantities: createDefaultIncomingQuantities(initialBagSizes),
      remarks: '',
    }),
    [gatePassNo, userId, initialCommodity, initialBagSizes, todayIso],
  );

  const formDefaultValues =
    mode === 'edit' && editDefaultValues ? editDefaultValues : createDefaultValues;

  const navigate = useNavigate();
  const { mutateAsync: createIncomingGatePass } = useCreateIncomingGatePass();
  const { mutateAsync: updateIncomingGatePass } = useUpdateIncomingGatePass();
  const showFinances = usePreferencesStore((s) => s.preferences?.showFinances ?? true);
  const coldStorageId = useStoreAdminStore((s) => s.storeAdmin?.coldStorageId);

  const handleCreateSubmit = useCallback(
    async (values: IncomingFormValues) => {
      try {
        const costPerBag = farmerStorageLinks.find(
          (link) => link._id === values.farmerIncomingLinkId,
        )?.costPerBag;

        const payload = buildCreateIncomingGatePassPayload(values, {
          showFinances,
          costPerBag,
          coldStorageId,
          createdById: userId,
        });

        const created = await createIncomingGatePass(payload);

        toast.success(`Incoming gate pass #${created.gatePassNo.toLocaleString('en-IN')} created`, {
          position: 'bottom-right',
        });
        navigate({ to: '/daybook', search: DEFAULT_DAYBOOK_SEARCH });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create incoming gate pass',
          { position: 'bottom-right' },
        );
        throw error;
      }
    },
    [farmerStorageLinks, showFinances, coldStorageId, userId, createIncomingGatePass, navigate],
  );

  const handleEditSubmit = useCallback(
    async (values: IncomingFormValues) => {
      if (!gatePassId || !editBaselineValues) {
        throw new Error('Edit context is missing for this gate pass.');
      }

      try {
        const costPerBag = farmerStorageLinks.find(
          (link) => link._id === values.farmerIncomingLinkId,
        )?.costPerBag;

        const payload = buildUpdateIncomingGatePassPayload(values, editBaselineValues, {
          showFinances,
          costPerBag,
          rentEntryVoucherId,
          originalBagSizes,
        });

        if (!payload) {
          toast.info('No changes to save', { position: 'bottom-right' });
          return;
        }

        const updated = await updateIncomingGatePass({ id: gatePassId, payload });

        toast.success(`Incoming gate pass #${updated.gatePassNo.toLocaleString('en-IN')} updated`, {
          position: 'bottom-right',
        });
        navigate({ to: '/daybook', search: DEFAULT_DAYBOOK_SEARCH });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to update incoming gate pass',
          { position: 'bottom-right' },
        );
        throw error;
      }
    },
    [
      gatePassId,
      editBaselineValues,
      farmerStorageLinks,
      showFinances,
      rentEntryVoucherId,
      originalBagSizes,
      updateIncomingGatePass,
      navigate,
    ],
  );

  const form = useIncomingForm({
    schemaConfig,
    defaultValues: formDefaultValues,
    onSubmitConfirmed: mode === 'create' ? handleCreateSubmit : handleEditSubmit,
  });

  const resetLabel = mode === 'edit' ? 'Reset changes' : 'Reset Form';
  const reviewLabel = mode === 'edit' ? 'Review changes' : 'Review';

  const showCommoditySelect = shouldShowCommoditySelect(commodities);
  const showStockFilter = shouldShowStockFilter(preferences?.stockFilter);
  const showCustomMarka = shouldShowCustomMarka(preferences?.customMarka);

  const selectedCommodity = useMemo(
    () => getCommodityByName(commodities, resolvedCommodityName),
    [commodities, resolvedCommodityName],
  );

  const varietyOptions = useMemo(
    () => toComboboxOptions(selectedCommodity?.varieties ?? []),
    [selectedCommodity],
  );
  const stockFilterOptions = useMemo(
    () => toComboboxOptions(preferences?.stockFilter?.options ?? []),
    [preferences?.stockFilter?.options],
  );
  const commodityOptions = useMemo(
    () => toComboboxOptions(commodities.map((commodity) => commodity.name)),
    [commodities],
  );
  const bagSizes = useMemo(() => getBagSizesForCommodity(selectedCommodity), [selectedCommodity]);

  const farmerOptions = useMemo<ComboboxOption[]>(
    () =>
      farmerStorageLinks.map((link) => ({
        id: link._id,
        label: `${getLinkDisplayName(link)} — Acct #${link.accountNumber}`,
      })),
    [farmerStorageLinks],
  );

  const [farmerSearch, setFarmerSearch] = useState(initialFarmerSearch);
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false);
  const [addFarmerOpen, setAddFarmerOpen] = useState(false);
  const [commoditySearch, setCommoditySearch] = useState('');
  const [commodityComboboxOpen, setCommodityComboboxOpen] = useState(false);
  const [varietySearch, setVarietySearch] = useState('');
  const [varietyComboboxOpen, setVarietyComboboxOpen] = useState(false);
  const [stockFilterSearch, setStockFilterSearch] = useState('');
  const [stockFilterComboboxOpen, setStockFilterComboboxOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const sortedFarmers = useMemo(
    () => filterAndSortOptions(farmerSearch, farmerOptions),
    [farmerSearch, farmerOptions],
  );
  const sortedCommodities = useMemo(
    () => filterAndSortOptions(commoditySearch, commodityOptions),
    [commoditySearch, commodityOptions],
  );
  const sortedVarieties = useMemo(
    () => filterAndSortOptions(varietySearch, varietyOptions),
    [varietySearch, varietyOptions],
  );
  const sortedStockFilters = useMemo(
    () => filterAndSortOptions(stockFilterSearch, stockFilterOptions),
    [stockFilterSearch, stockFilterOptions],
  );

  const formId = mode === 'edit' ? 'edit-incoming-form' : 'create-incoming-form';
  const fieldIdPrefix = mode === 'edit' ? 'edit-incoming' : 'create-incoming';

  const resetCropComboboxState = useCallback(() => {
    setCommoditySearch('');
    setCommodityComboboxOpen(false);
    setVarietySearch('');
    setVarietyComboboxOpen(false);
    setStockFilterSearch('');
    setStockFilterComboboxOpen(false);
  }, []);

  const handleCommodityChange = useCallback(
    (commodityName: string) => {
      const commodity = getCommodityByName(commodities, commodityName);
      setSelectedCommodityName(commodityName);
      form.setFieldValue('variety', '');
      form.setFieldValue('stockFilter', '');
      form.setFieldValue('customMarka', '');
      form.setFieldValue('quantities', createQuantitiesForSizes(commodity?.sizes ?? []));
      resetCropComboboxState();
    },
    [commodities, form, resetCropComboboxState],
  );

  const getFarmerLabel = useCallback(
    (farmerIncomingLinkId: string) =>
      farmerOptions.find((option) => option.id === farmerIncomingLinkId)?.label ??
      farmerIncomingLinkId,
    [farmerOptions],
  );

  const getFarmerCostPerBag = useCallback(
    (farmerIncomingLinkId: string) =>
      farmerStorageLinks.find((link) => link._id === farmerIncomingLinkId)?.costPerBag,
    [farmerStorageLinks],
  );

  const handleFarmerAdded = useCallback(
    (link: FarmerStorageLink) => {
      form.setFieldValue('farmerIncomingLinkId', link._id);
      setFarmerSearch(`${getLinkDisplayName(link)} — Acct #${link.accountNumber}`);
      setFarmerComboboxOpen(false);
    },
    [form],
  );

  const handleOpenReview = useCallback(() => {
    const result = formSchema.safeParse(form.state.values);
    if (!result.success) {
      void form.handleSubmit({ submitAction: 'review' });
      return;
    }
    setReviewOpen(true);
  }, [form, formSchema]);

  const handleConfirmSubmit = useCallback(() => {
    void form.handleSubmit({ submitAction: 'submit' }).then(() => {
      setReviewOpen(false);
    });
  }, [form]);

  const handleReset = useCallback(() => {
    if (mode === 'edit' && editDefaultValues) {
      form.reset(editDefaultValues);
      setSelectedCommodityName(initialSelectedCommodity);
      setFarmerSearch(initialFarmerSearch);
      resetCropComboboxState();
      return;
    }

    form.reset({
      ...createDefaultValues,
      gatePassNo,
      date: new Date().toISOString(),
    });
    setSelectedCommodityName('');
    setFarmerSearch('');
    setFarmerComboboxOpen(false);
    resetCropComboboxState();
    onRefetchGatePassNo?.();
  }, [
    mode,
    editDefaultValues,
    form,
    initialSelectedCommodity,
    initialFarmerSearch,
    resetCropComboboxState,
    createDefaultValues,
    gatePassNo,
    onRefetchGatePassNo,
  ]);

  const cropFieldsDisabled = commodities.length === 0 || !selectedCommodity;

  const title = mode === 'edit' ? 'Edit Incoming Gate Pass' : 'Incoming Gate Pass';
  const description =
    mode === 'edit'
      ? 'Update crop and account details for this incoming gate pass.'
      : 'Record crop and account details for a new incoming gate pass.';

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm">
      <CardHeader className="bg-muted/30 border-b px-4 pb-6 sm:px-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          {title}{' '}
          {gatePassNoLoading ? (
            <Skeleton className="inline-block h-7 w-16 align-middle" />
          ) : (
            <span className="text-primary tabular-nums">#{gatePassNo.toLocaleString('en-IN')}</span>
          )}
        </CardTitle>
        {gatePassNoError ? (
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span>
              {gatePassNoError instanceof Error
                ? gatePassNoError.message
                : 'Could not load gate pass number.'}
            </span>
            {onRefetchGatePassNo ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void onRefetchGatePassNo()}
              >
                Retry
              </Button>
            ) : null}
          </div>
        ) : null}
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <form id={formId} noValidate onSubmit={(e) => e.preventDefault()}>
        <CardContent className="px-4 pt-6 pb-6 sm:px-6">
          <FieldGroup className="@container/field-group gap-6">
            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                General Information
              </FieldLegend>
              <FieldDescription>
                Gate pass reference, date, and linked farmer account.
              </FieldDescription>
              <FieldGroup className="mt-4 grid grid-cols-1 gap-4 @md/field-group:grid-cols-2">
                <form.Field
                  name="manualGatePassNumber"
                  validators={{ onChange: formSchema.shape.manualGatePassNumber }}
                >
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Manual Gate Pass No.</FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={field.name}
                          name={field.name}
                          value={field.state.value ?? ''}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(parseOptionalNumber(e.target.value))}
                          aria-invalid={isInvalid}
                          placeholder="e.g. 1024 (optional)"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="date" validators={{ onChange: formSchema.shape.date }}>
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
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

                <form.Field
                  name="truckNumber"
                  validators={{ onChange: formSchema.shape.truckNumber }}
                >
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={`${fieldIdPrefix}-truck-number`}>
                          Truck number
                        </FieldLabel>
                        <Input
                          id={`${fieldIdPrefix}-truck-number`}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(normalizeUppercase(e.target.value))}
                          aria-invalid={isInvalid}
                          placeholder="e.g. HR-26-AB-1234 (optional)"
                          className="uppercase"
                          maxLength={TRUCK_NUMBER_MAX_LENGTH}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field
                  name="farmerIncomingLinkId"
                  validators={{ onChange: formSchema.shape.farmerIncomingLinkId }}
                >
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid} className="@md/field-group:col-span-2">
                        <FieldLabel htmlFor={`${fieldIdPrefix}-farmer`}>Farmer</FieldLabel>
                        <div className="flex gap-2">
                          <div className="min-w-0 flex-1">
                            <SearchableOptionCombobox
                              id={`${fieldIdPrefix}-farmer`}
                              name={field.name}
                              value={field.state.value}
                              onValueChange={field.handleChange}
                              onBlur={field.handleBlur}
                              isInvalid={isInvalid}
                              disabled={isFarmersLoading || isFarmersError}
                              placeholder={
                                isFarmersLoading ? 'Loading farmers...' : 'Search farmers...'
                              }
                              emptyMessage="No farmers found."
                              options={farmerOptions}
                              sortedOptions={sortedFarmers}
                              search={farmerSearch}
                              setSearch={setFarmerSearch}
                              open={farmerComboboxOpen}
                              setOpen={setFarmerComboboxOpen}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-auto min-h-9 shrink-0 gap-1.5 px-3"
                            onClick={() => setAddFarmerOpen(true)}
                            aria-label="Add farmer"
                          >
                            <UserPlus className="size-4 shrink-0" />
                            <span className="hidden sm:inline">Add Farmer</span>
                          </Button>
                        </div>
                        {isFarmersError && (
                          <FieldDescription className="text-destructive">
                            {farmersError instanceof Error
                              ? farmersError.message
                              : 'Something went wrong while fetching farmers.'}
                          </FieldDescription>
                        )}
                        {farmerLinkWarning ? (
                          <FieldDescription className="text-destructive">
                            {farmerLinkWarning}
                          </FieldDescription>
                        ) : null}
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Crop Information
              </FieldLegend>
              <FieldDescription>
                Commodity, variety, and stock attributes for incoming crop.
              </FieldDescription>
              {commodities.length === 0 ? (
                <FieldDescription className="text-muted-foreground mt-3">
                  No commodities configured in preferences. Add commodities in settings to record
                  crop details.
                </FieldDescription>
              ) : null}
              <FieldGroup className="mt-4 grid grid-cols-1 gap-4 @md/field-group:grid-cols-2">
                {showCommoditySelect ? (
                  <form.Field
                    name="commodity"
                    validators={{ onChange: formSchema.shape.commodity }}
                  >
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={`${fieldIdPrefix}-commodity`}>Commodity</FieldLabel>
                          <SearchableOptionCombobox
                            id={`${fieldIdPrefix}-commodity`}
                            name={field.name}
                            value={field.state.value}
                            onValueChange={(value) => {
                              field.handleChange(value);
                              handleCommodityChange(value);
                            }}
                            onBlur={field.handleBlur}
                            isInvalid={isInvalid}
                            placeholder="Search commodities..."
                            emptyMessage="No commodities found."
                            options={commodityOptions}
                            sortedOptions={sortedCommodities}
                            search={commoditySearch}
                            setSearch={setCommoditySearch}
                            open={commodityComboboxOpen}
                            setOpen={setCommodityComboboxOpen}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>
                ) : null}

                <form.Field name="variety" validators={{ onChange: formSchema.shape.variety }}>
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={`${fieldIdPrefix}-variety`}>Variety</FieldLabel>
                        <SearchableOptionCombobox
                          id={`${fieldIdPrefix}-variety`}
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          disabled={cropFieldsDisabled}
                          placeholder="Search varieties..."
                          emptyMessage="No varieties found."
                          options={varietyOptions}
                          sortedOptions={sortedVarieties}
                          search={varietySearch}
                          setSearch={setVarietySearch}
                          open={varietyComboboxOpen}
                          setOpen={setVarietyComboboxOpen}
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
                          <FieldLabel htmlFor={`${fieldIdPrefix}-stock-filter`}>
                            Stock filter
                          </FieldLabel>
                          <SearchableOptionCombobox
                            id={`${fieldIdPrefix}-stock-filter`}
                            name={field.name}
                            value={field.state.value}
                            onValueChange={field.handleChange}
                            onBlur={field.handleBlur}
                            isInvalid={isInvalid}
                            disabled={cropFieldsDisabled}
                            placeholder="Search stock filters..."
                            emptyMessage="No stock filters found."
                            options={stockFilterOptions}
                            sortedOptions={sortedStockFilters}
                            search={stockFilterSearch}
                            setSearch={setStockFilterSearch}
                            open={stockFilterComboboxOpen}
                            setOpen={setStockFilterComboboxOpen}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>
                ) : null}

                {showCustomMarka ? (
                  <form.Field
                    name="customMarka"
                    validators={{ onChange: formSchema.shape.customMarka }}
                  >
                    {(field) => {
                      const isInvalid = isFieldInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={`${fieldIdPrefix}-custom-marka`}>
                            Custom marka
                          </FieldLabel>
                          <Input
                            id={`${fieldIdPrefix}-custom-marka`}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            disabled={cropFieldsDisabled}
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

            <FieldSeparator />

            <IncomingQuantitiesSection
              form={form}
              bagSizes={bagSizes}
              farmerStorageLinks={farmerStorageLinks}
            />

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Additional Notes
              </FieldLegend>
              <FieldGroup className="mt-4">
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

        <CardFooter className="bg-muted/30 justify-end gap-3 border-t px-4 py-6 sm:px-6">
          <Button variant="outline" type="button" onClick={handleReset}>
            {resetLabel}
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button
                type="button"
                disabled={isSubmitting || !gatePassNoReady}
                onClick={handleOpenReview}
              >
                {isSubmitting ? 'Validating…' : reviewLabel}
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
          if (!reviewOpen) return null;

          const parsed = formSchema.safeParse(values);

          return (
            <IncomingSummarySheet
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              values={parsed.success ? parsed.data : null}
              farmerLabel={parsed.success ? getFarmerLabel(parsed.data.farmerIncomingLinkId) : ''}
              costPerBag={
                parsed.success ? getFarmerCostPerBag(parsed.data.farmerIncomingLinkId) : undefined
              }
              showCommodity={showCommoditySelect}
              onBack={() => setReviewOpen(false)}
              onSubmit={handleConfirmSubmit}
              canSubmit={canSubmit && gatePassNoReady}
              isSubmitting={isSubmitting}
              submitLabel={mode === 'edit' ? 'Save changes' : undefined}
            />
          );
        }}
      />

      <AddFarmerDialog
        open={addFarmerOpen}
        onOpenChange={setAddFarmerOpen}
        links={farmerStorageLinks}
        onSuccess={handleFarmerAdded}
      />
    </Card>
  );
}
