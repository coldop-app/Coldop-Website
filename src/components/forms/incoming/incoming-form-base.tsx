import { memo, useMemo, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/forms/date-picker';
import { payloadDateSchema } from '@/lib/helpers';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';
import { AddFarmerModal } from '@/components/forms/add-farmer-modal';
import { useGetAllFarmers } from '@/services/store-admin/functions/useGetAllFarmers';
import { useGetPreferences } from '@/services/preferences/useGetPreferences';
import {
  IncomingSummarySheet,
  type IncomingSummaryFormValues,
  type QuantityRow,
} from '@/components/forms/incoming/incoming-summary-sheet';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';
import { useStore } from '@/stores/store';
import { shouldShowSpecialFields } from '@/lib/special-fields';
import { Plus, Trash2 } from 'lucide-react';

const DEFAULT_LOCATION = { chamber: '', floor: '', row: '' };

type LocationEntry = { chamber: string; floor: string; row: string };

export type ExtraQuantityRow = { id: string; size: string; quantity: number };

const EXTRA_ROW_KEY_PREFIX = 'extra:';

type FieldErrors = Array<{ message?: string } | undefined>;

/** Payload built from the form and passed to onSubmit (create or edit). */
export type IncomingFormSubmitPayload = {
  farmerStorageLinkId: string;
  date: string;
  variety: string;
  truckNumber?: string;
  bagSizes: Array<{
    name: string;
    initialQuantity: number;
    currentQuantity: number;
    location: { chamber: string; floor: string; row: string };
  }>;
  remarks: string;
  manualParchiNumber?: string;
  amount?: number;
  stockFilter?: string;
  customMarka?: string;
};

export interface IncomingFormBaseProps {
  mode: 'create' | 'edit';
  editEntry?: DaybookEntry;
  onSubmit: (payload: IncomingFormSubmitPayload) => void | Promise<void>;
  voucherNumberDisplay: string;
  isSubmitting?: boolean;
  /** For create mode: next voucher number shown in summary sheet */
  gatePassNoForSummary?: number;
  /** For create mode: whether voucher number is still loading */
  isLoadingVoucher?: boolean;
}

export const IncomingFormBase = memo(function IncomingFormBase({
  mode,
  editEntry,
  onSubmit: onSubmitProp,
  voucherNumberDisplay,
  isSubmitting = false,
  gatePassNoForSummary = 0,
  isLoadingVoucher = false,
}: IncomingFormBaseProps) {
  const isEditMode = mode === 'edit';
  const admin = useStore((s) => s.admin);
  const showSpecialFields = shouldShowSpecialFields(admin?.mobileNumber);

  const {
    data: farmerLinks,
    isLoading: isLoadingFarmers,
    refetch: refetchFarmers,
  } = useGetAllFarmers();

  const { data: preferences, isLoading: isLoadingPreferences } =
    useGetPreferences();

  /** Bag sizes from preferences (first commodity). */
  const quantitySizes = useMemo(
    () => preferences?.commodities?.[0]?.sizes ?? [],
    [preferences]
  );

  /** Variety options from preferences (first commodity) */
  const varietyOptions: Option<string>[] = useMemo(() => {
    const commodity = preferences?.commodities?.[0];
    if (!commodity?.varieties?.length) return [];
    return commodity.varieties.map((v) => ({
      value: v,
      label: v,
      searchableText: v,
    }));
  }, [preferences]);

  /** Stock filter options (shown only for specific account) */
  const stockFilterOptions: Option<string>[] = [
    { value: 'OWNED', label: 'OWNED', searchableText: 'OWNED' },
    { value: 'FARMER', label: 'FARMER', searchableText: 'FARMER' },
  ];

  const farmerOptions: Option<string>[] = useMemo(() => {
    if (!farmerLinks) return [];
    return farmerLinks
      .filter((link) => link.isActive)
      .map((link) => ({
        value: link._id,
        label: `${link.farmerId.name} (Account #${link.accountNumber})`,
        searchableText: `${link.farmerId.name} ${link.accountNumber} ${link.farmerId.mobileNumber} ${link.farmerId.address}`,
      }));
  }, [farmerLinks]);

  const handleFarmerSelect = (value: string) => {
    form.setFieldValue('farmerStorageLinkId', value);
  };

  const handleFarmerAdded = () => {
    refetchFarmers();
  };

  /* -------------------------------------------------
     ZOD SCHEMA
  ------------------------------------------------- */

  const formSchema = useMemo(
    () =>
      z
        .object({
          manualParchiNumber: z.string().trim().optional(),
          farmerStorageLinkId: z.string().min(1, 'Please select a farmer'),
          date: payloadDateSchema,
          variety: z.string().min(1, 'Please select a variety'),
          truckNumber: z
            .string()
            .trim()
            .optional()
            .transform((val) => val?.toUpperCase()),
          sizeQuantities: z.record(z.string(), z.number().min(0)),
          extraQuantityRows: z.array(
            z.object({
              id: z.string(),
              size: z.string(),
              quantity: z.number().min(0),
            })
          ),
          locationBySize: z.record(
            z.string(),
            z.object({
              chamber: z.string(),
              floor: z.string(),
              row: z.string(),
            })
          ),
          remarks: z.string().max(500).default(''),
          manualGatePassNumber: z.union([z.number(), z.undefined()]),
          stockFilter: showSpecialFields
            ? z.string().trim().min(1, 'Please select a stock filter')
            : z.string().trim().optional(),
          customMarka: showSpecialFields
            ? z.string().trim().min(1, 'Please enter custom marka')
            : z.string().trim().optional(),
        })
        .refine(
          (data) => {
            const withQty = Object.entries(data.sizeQuantities).filter(
              ([, qty]) => (qty ?? 0) > 0
            );
            const fixedOk = withQty.every(([size]) => {
              const loc = data.locationBySize?.[size];
              return (
                loc &&
                loc.chamber?.trim() !== '' &&
                loc.floor?.trim() !== '' &&
                loc.row?.trim() !== ''
              );
            });
            if (!fixedOk) return false;
            const extraWithQty = (data.extraQuantityRows ?? []).filter(
              (row) => (row.quantity ?? 0) > 0
            );
            return extraWithQty.every((row) => {
              const key = `${EXTRA_ROW_KEY_PREFIX}${row.id}`;
              const loc = data.locationBySize?.[key];
              return (
                loc &&
                loc.chamber?.trim() !== '' &&
                loc.floor?.trim() !== '' &&
                loc.row?.trim() !== ''
              );
            });
          },
          {
            message:
              'Please enter chamber, floor and row for each size that has a quantity.',
            path: ['locationBySize'],
          }
        )
        .refine(
          (data) => {
            const fixedTotal = Object.values(data.sizeQuantities).reduce(
              (sum, qty) => sum + (qty ?? 0),
              0
            );
            const extraTotal = (data.extraQuantityRows ?? []).reduce(
              (sum, row) => sum + (row.quantity ?? 0),
              0
            );
            return fixedTotal + extraTotal > 0;
          },
          {
            message: 'Please enter at least one quantity.',
            path: ['sizeQuantities'],
          }
        ),
    [showSpecialFields]
  );

  /* -------------------------------------------------
     DEFAULT VALUES
  ------------------------------------------------- */

  const defaultSizeQuantities = useMemo(
    () =>
      Object.fromEntries(quantitySizes.map((size) => [size, 0])) as Record<
        string,
        number
      >,
    [quantitySizes]
  );

  const editDefaultValues = useMemo(() => {
    if (!editEntry?.bagSizes?.length || !quantitySizes.length) return null;
    const sizeQuantities = { ...defaultSizeQuantities };
    const locationBySize: Record<string, LocationEntry> = {};
    const extraQuantityRows: ExtraQuantityRow[] = [];
    /** Track first occurrence of each size name; duplicates go to extra rows. */
    const sizeNameSeen = new Set<string>();
    for (const bag of editEntry.bagSizes) {
      if (!quantitySizes.includes(bag.name)) continue;
      const loc = bag.location
        ? {
            chamber: bag.location.chamber ?? '',
            floor: bag.location.floor ?? '',
            row: bag.location.row ?? '',
          }
        : { ...DEFAULT_LOCATION };
      if (!sizeNameSeen.has(bag.name)) {
        sizeNameSeen.add(bag.name);
        sizeQuantities[bag.name] = bag.initialQuantity;
        locationBySize[bag.name] = loc;
      } else {
        const extraId = crypto.randomUUID();
        extraQuantityRows.push({
          id: extraId,
          size: bag.name,
          quantity: bag.initialQuantity,
        });
        locationBySize[`${EXTRA_ROW_KEY_PREFIX}${extraId}`] = loc;
      }
    }
    return {
      manualParchiNumber: editEntry.manualParchiNumber ?? '',
      farmerStorageLinkId: editEntry.farmerStorageLinkId?._id ?? '',
      date: editEntry.date
        ? new Date(editEntry.date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      variety: editEntry.variety ?? '',
      truckNumber: editEntry.truckNumber ?? '',
      sizeQuantities,
      extraQuantityRows,
      locationBySize,
      remarks: editEntry.remarks ?? '',
      manualGatePassNumber: undefined as number | undefined,
      stockFilter: editEntry.stockFilter ?? '',
      customMarka: editEntry.customMarka ?? '',
    };
  }, [editEntry, quantitySizes, defaultSizeQuantities]);

  const resolvedDefaultValues = isEditMode
    ? editDefaultValues
    : {
        manualParchiNumber: '',
        farmerStorageLinkId: '',
        date: new Date().toISOString().slice(0, 10),
        variety: '',
        truckNumber: '',
        sizeQuantities: defaultSizeQuantities,
        extraQuantityRows: [] as ExtraQuantityRow[],
        locationBySize: {} as Record<string, LocationEntry>,
        remarks: '',
        manualGatePassNumber: undefined as number | undefined,
        stockFilter: '',
        customMarka: '',
      };

  const [step, setStep] = useState<1 | 2>(1);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const openSheetRef = useRef(false);

  const form = useForm({
    defaultValues: resolvedDefaultValues ?? {
      manualParchiNumber: '',
      farmerStorageLinkId: '',
      date: new Date().toISOString().slice(0, 10),
      variety: '',
      truckNumber: '',
      sizeQuantities: defaultSizeQuantities,
      extraQuantityRows: [] as ExtraQuantityRow[],
      locationBySize: {} as Record<string, LocationEntry>,
      remarks: '',
      manualGatePassNumber: undefined as number | undefined,
      stockFilter: '',
      customMarka: '',
    },
    validators: {
      onSubmit: formSchema as never,
    },
    onSubmit: async ({ value }) => {
      const selectedLink = farmerLinks?.find(
        (l) => l._id === value.farmerStorageLinkId
      );
      const fixedQty = quantitySizes.reduce(
        (sum, size) => sum + (value.sizeQuantities[size] ?? 0),
        0
      );
      const extraQty = (value.extraQuantityRows ?? []).reduce(
        (sum, row) => sum + (row.quantity ?? 0),
        0
      );
      const totalQty = fixedQty + extraQty;
      const amount = totalQty * (selectedLink?.costPerBag ?? 0);

      const bagSizesFromFixed = quantitySizes
        .filter((size) => (value.sizeQuantities[size] ?? 0) > 0)
        .map((size) => {
          const qty = value.sizeQuantities[size] ?? 0;
          const loc = value.locationBySize[size] ?? { ...DEFAULT_LOCATION };
          return {
            name: size,
            initialQuantity: qty,
            currentQuantity: qty,
            location: {
              chamber: loc.chamber.trim(),
              floor: loc.floor.trim(),
              row: loc.row.trim(),
            },
          };
        });
      const bagSizesFromExtra = (value.extraQuantityRows ?? [])
        .filter((row) => (row.quantity ?? 0) > 0)
        .map((row) => {
          const key = `${EXTRA_ROW_KEY_PREFIX}${row.id}`;
          const loc = value.locationBySize[key] ?? { ...DEFAULT_LOCATION };
          return {
            name: row.size,
            initialQuantity: row.quantity,
            currentQuantity: row.quantity,
            location: {
              chamber: loc.chamber.trim(),
              floor: loc.floor.trim(),
              row: loc.row.trim(),
            },
          };
        });
      const bagSizes = [...bagSizesFromFixed, ...bagSizesFromExtra];

      const payload: IncomingFormSubmitPayload = {
        farmerStorageLinkId: value.farmerStorageLinkId,
        date: payloadDateSchema.parse(value.date),
        variety: value.variety,
        truckNumber: value.truckNumber?.trim() || undefined,
        bagSizes,
        remarks: value.remarks?.trim() ?? '',
        manualParchiNumber: value.manualParchiNumber?.trim() || undefined,
        amount: amount > 0 ? amount : undefined,
        stockFilter: value.stockFilter?.trim() || undefined,
        customMarka: value.customMarka?.trim() || undefined,
      };

      if (!isEditMode && !openSheetRef.current) {
        openSheetRef.current = true;
        setSummaryOpen(true);
        return;
      }

      if (!isEditMode) {
        openSheetRef.current = false;
      }

      await onSubmitProp(payload);

      if (!isEditMode) {
        form.reset();
        setStep(1);
        setSummaryOpen(false);
      }
    },
  });

  /* -------------------------------------------------
     UI
  ------------------------------------------------- */

  const formValues = form.state.values as IncomingSummaryFormValues;
  const selectedLinkForSummary = farmerLinks?.find(
    (l) => l._id === formValues.farmerStorageLinkId
  );
  const totalQtyForSummary =
    quantitySizes.reduce(
      (sum, size) => sum + (formValues.sizeQuantities[size] ?? 0),
      0
    ) +
    (formValues.extraQuantityRows ?? []).reduce(
      (sum, row) => sum + (row.quantity ?? 0),
      0
    );
  const quantityRowsForSummary: QuantityRow[] = useMemo(() => {
    const fixed = quantitySizes
      .filter((size) => (formValues.sizeQuantities[size] ?? 0) > 0)
      .map((size) => ({
        sizeName: size,
        quantity: formValues.sizeQuantities[size] ?? 0,
        location: formValues.locationBySize?.[size],
      }));
    const extra = (formValues.extraQuantityRows ?? [])
      .filter((row) => (row.quantity ?? 0) > 0)
      .map((row) => ({
        sizeName: row.size,
        quantity: row.quantity ?? 0,
        location:
          formValues.locationBySize?.[`${EXTRA_ROW_KEY_PREFIX}${row.id}`],
      }));
    return [...fixed, ...extra];
  }, [
    quantitySizes,
    formValues.sizeQuantities,
    formValues.extraQuantityRows,
    formValues.locationBySize,
  ]);
  const totalRentForSummary =
    selectedLinkForSummary != null
      ? totalQtyForSummary * (selectedLinkForSummary.costPerBag ?? 0)
      : null;
  const farmerDisplayName =
    farmerOptions.find((o) => o.value === formValues.farmerStorageLinkId)
      ?.label ?? '—';

  if (isEditMode && quantitySizes.length === 0 && isLoadingPreferences) {
    return (
      <main className="font-custom mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-12">
        <p className="text-muted-foreground font-custom text-sm">
          Loading form…
        </p>
      </main>
    );
  }

  if (isEditMode && !resolvedDefaultValues) {
    return (
      <main className="font-custom mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-12">
        <p className="text-muted-foreground font-custom text-sm">
          No incoming order data. Please open edit from the daybook.
        </p>
      </main>
    );
  }

  return (
    <main className="font-custom mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-12">
      <div className="mb-8 space-y-4">
        <h1 className="font-custom text-foreground text-3xl font-bold sm:text-4xl">
          {isEditMode ? 'Edit Incoming Gate Pass' : 'Create Incoming Gate Pass'}
        </h1>

        <div className="bg-primary/20 inline-block rounded-full px-4 py-1.5">
          <span className="font-custom text-primary text-sm font-medium">
            VOUCHER NO: {voucherNumberDisplay}
          </span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (step === 2) {
            form.handleSubmit();
          } else setStep(2);
        }}
        className="space-y-6"
      >
        <FieldGroup className="space-y-6">
          {step === 1 && (
            <>
              <form.Field
                name="manualParchiNumber"
                children={(field) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      Manual Parchi Number
                      <span className="font-custom text-muted-foreground ml-1 font-normal">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. P-123"
                      className="font-custom"
                    />
                  </Field>
                )}
              />

              <form.Field
                name="farmerStorageLinkId"
                children={(field) => {
                  const hasSubmitError = Boolean(
                    field.state.meta.errorMap &&
                    'onSubmit' in field.state.meta.errorMap &&
                    field.state.meta.errorMap.onSubmit
                  );
                  const invalidFromValidation =
                    hasSubmitError ||
                    (field.state.meta.isTouched && !field.state.meta.isValid);
                  const isInvalid = invalidFromValidation && !field.state.value;
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <FieldLabel
                            htmlFor="farmer-select"
                            className="font-custom mb-2 block text-base font-semibold"
                          >
                            Enter Account Name (search and select)
                          </FieldLabel>
                          <SearchSelector
                            id="farmer-select"
                            options={farmerOptions}
                            placeholder="Search or Create Farmer"
                            searchPlaceholder="Search by name, account number, or mobile..."
                            onSelect={handleFarmerSelect}
                            value={field.state.value}
                            loading={isLoadingFarmers}
                            loadingMessage="Loading farmers..."
                            emptyMessage="No farmers found"
                            buttonClassName="w-full justify-between"
                          />
                        </div>
                        <AddFarmerModal
                          links={farmerLinks ?? []}
                          onFarmerAdded={handleFarmerAdded}
                        />
                      </div>
                      {isInvalid && (
                        <FieldError
                          errors={
                            field.state.meta.errors as Array<
                              { message?: string } | undefined
                            >
                          }
                        />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="date"
                children={(field) => (
                  <Field>
                    <DatePicker
                      value={field.state.value}
                      onChange={(v) => field.handleChange(v)}
                      label="Date"
                    />
                  </Field>
                )}
              />

              <form.Field
                name="variety"
                children={(field) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      Select Variety
                    </FieldLabel>
                    <SearchSelector
                      options={varietyOptions}
                      onSelect={(v) => field.handleChange(v)}
                      value={field.state.value}
                      buttonClassName="w-full justify-between"
                      loading={isLoadingPreferences}
                      loadingMessage="Loading varieties..."
                      emptyMessage="No varieties configured"
                    />
                  </Field>
                )}
              />

              <form.Field
                name="truckNumber"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                        Truck Number
                      </FieldLabel>
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value.toUpperCase())
                        }
                      />
                      {isInvalid && (
                        <FieldError
                          errors={field.state.meta.errors as FieldErrors}
                        />
                      )}
                    </Field>
                  );
                }}
              />

              {showSpecialFields && (
                <>
                  <form.Field
                    name="stockFilter"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                            Stock Filter
                            <span className="font-custom text-destructive ml-1">
                              *
                            </span>
                          </FieldLabel>
                          <SearchSelector
                            options={stockFilterOptions}
                            onSelect={(v) => field.handleChange(v)}
                            value={field.state.value ?? ''}
                            buttonClassName="w-full justify-between"
                            placeholder="Select stock filter"
                            emptyMessage="No option selected"
                          />
                          {isInvalid && (
                            <FieldError
                              errors={field.state.meta.errors as FieldErrors}
                            />
                          )}
                        </Field>
                      );
                    }}
                  />
                  <form.Field
                    name="customMarka"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                            Custom Marka
                            <span className="font-custom text-destructive ml-1">
                              *
                            </span>
                          </FieldLabel>
                          <Input
                            value={field.state.value ?? ''}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Custom marka"
                            className="font-custom"
                          />
                          {isInvalid && (
                            <FieldError
                              errors={field.state.meta.errors as FieldErrors}
                            />
                          )}
                        </Field>
                      );
                    }}
                  />
                </>
              )}

              <form.Field
                name="sizeQuantities"
                children={(field) => (
                  <form.Subscribe
                    selector={(state) => ({
                      variety: state.values.variety,
                      farmerStorageLinkId: state.values.farmerStorageLinkId,
                      extraQuantityRows: state.values.extraQuantityRows ?? [],
                    })}
                  >
                    {({ variety, farmerStorageLinkId, extraQuantityRows }) => {
                      const sizeQuantities = field.state.value;
                      const fixedTotal = quantitySizes.reduce(
                        (sum, size) => sum + (sizeQuantities[size] ?? 0),
                        0
                      );
                      const extraTotal = extraQuantityRows.reduce(
                        (sum, row) => sum + (row.quantity ?? 0),
                        0
                      );
                      const totalQty = fixedTotal + extraTotal;
                      const selectedLink = farmerLinks?.find(
                        (l) => l._id === farmerStorageLinkId
                      );
                      const costPerBag = selectedLink?.costPerBag ?? 0;
                      const totalRent = totalQty * costPerBag;
                      const quantitiesDisabled = !variety?.trim();

                      const addExtraRow = () => {
                        const next = [
                          ...extraQuantityRows,
                          {
                            id: crypto.randomUUID(),
                            size: quantitySizes[0] ?? '',
                            quantity: 0,
                          },
                        ];
                        form.setFieldValue(
                          'extraQuantityRows' as never,
                          next as never
                        );
                      };

                      const updateExtraRow = (
                        id: string,
                        updates: { size?: string; quantity?: number }
                      ) => {
                        const next = extraQuantityRows.map((row) =>
                          row.id === id ? { ...row, ...updates } : row
                        );
                        form.setFieldValue(
                          'extraQuantityRows' as never,
                          next as never
                        );
                      };

                      const removeExtraRow = (id: string) => {
                        const next = extraQuantityRows.filter(
                          (row) => row.id !== id
                        );
                        form.setFieldValue(
                          'extraQuantityRows' as never,
                          next as never
                        );
                      };

                      return (
                        <Card className="overflow-hidden">
                          <CardHeader className="space-y-1.5 pb-4">
                            <CardTitle className="font-custom text-foreground text-xl font-semibold">
                              Enter Quantities
                            </CardTitle>
                            <CardDescription className="font-custom text-muted-foreground text-sm">
                              {quantitiesDisabled
                                ? 'Please select a variety first to enter quantities.'
                                : 'Enter quantity for each size. Add extra size rows to track bags at multiple locations.'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {quantitySizes.map((size) => {
                              const value = sizeQuantities[size] ?? 0;
                              const displayValue =
                                value === 0 ? '' : String(value);
                              return (
                                <div
                                  key={size}
                                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <label
                                    htmlFor={`qty-${size}`}
                                    className="font-custom text-foreground text-base font-normal"
                                  >
                                    {size}
                                  </label>
                                  <Input
                                    id={`qty-${size}`}
                                    type="number"
                                    min={0}
                                    placeholder="-"
                                    disabled={quantitiesDisabled}
                                    value={displayValue}
                                    onChange={(e) => {
                                      const next = { ...field.state.value };
                                      const raw = e.target.value;
                                      const num =
                                        raw === ''
                                          ? 0
                                          : Math.max(0, parseInt(raw, 10) || 0);
                                      field.handleChange({
                                        ...next,
                                        [size]: num,
                                      });
                                    }}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onKeyDown={(e) => {
                                      if (
                                        e.key === 'ArrowUp' ||
                                        e.key === 'ArrowDown'
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                    className="w-full sm:w-28 sm:text-right [&]:[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                  />
                                </div>
                              );
                            })}
                            {extraQuantityRows.map((row) => {
                              const displayValue =
                                row.quantity === 0 ? '' : String(row.quantity);
                              return (
                                <div
                                  key={row.id}
                                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                                >
                                  <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-row">
                                    <select
                                      aria-label="Select size"
                                      disabled={quantitiesDisabled}
                                      value={row.size}
                                      onChange={(e) =>
                                        updateExtraRow(row.id, {
                                          size: e.target.value,
                                        })
                                      }
                                      className="border-input bg-background text-foreground font-custom focus-visible:ring-ring h-9 flex-1 rounded-md border px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-32"
                                    >
                                      {quantitySizes.map((s) => (
                                        <option key={s} value={s}>
                                          {s}
                                        </option>
                                      ))}
                                    </select>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="text-muted-foreground hover:text-destructive shrink-0"
                                      onClick={() => removeExtraRow(row.id)}
                                      aria-label={`Remove ${row.size || 'size'} row`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Input
                                    type="number"
                                    min={0}
                                    placeholder="-"
                                    disabled={quantitiesDisabled}
                                    value={displayValue}
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const num =
                                        raw === ''
                                          ? 0
                                          : Math.max(0, parseInt(raw, 10) || 0);
                                      updateExtraRow(row.id, { quantity: num });
                                    }}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onKeyDown={(e) => {
                                      if (
                                        e.key === 'ArrowUp' ||
                                        e.key === 'ArrowDown'
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                    className="w-full sm:w-28 sm:text-right [&]:[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                  />
                                </div>
                              );
                            })}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addExtraRow}
                              disabled={quantitiesDisabled}
                              className="font-custom w-full sm:w-auto"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Size
                            </Button>
                            <Separator className="my-4" />
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <span className="font-custom text-foreground text-base font-normal">
                                Total / Lot No.
                              </span>
                              <span className="font-custom text-foreground text-base font-medium sm:text-right">
                                {totalQty}
                              </span>
                            </div>
                            <div className="border-primary/30 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                              <span className="font-custom text-foreground text-base font-normal">
                                Total Rent
                              </span>
                              <div className="flex flex-col items-end gap-0.5 sm:text-right">
                                {selectedLink != null ? (
                                  <>
                                    <span className="font-custom text-primary text-lg font-semibold">
                                      ₹{totalRent.toLocaleString()}
                                    </span>
                                    <span className="font-custom text-muted-foreground text-sm">
                                      ({totalQty} bags × ₹
                                      {costPerBag.toLocaleString()} per bag)
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-custom text-foreground text-base font-medium">
                                    —
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }}
                  </form.Subscribe>
                )}
              />
            </>
          )}

          {step === 2 && (
            <>
              <form.Field
                name="locationBySize"
                children={(field) => (
                  <form.Subscribe
                    selector={(state) => ({
                      sizeQuantities: state.values.sizeQuantities,
                      extraQuantityRows: state.values.extraQuantityRows ?? [],
                    })}
                  >
                    {({ sizeQuantities, extraQuantityRows }) => {
                      const fixedWithQty = quantitySizes
                        .filter((size) => (sizeQuantities[size] ?? 0) > 0)
                        .map((size) => ({
                          key: size,
                          sizeLabel: size,
                          quantity: sizeQuantities[size] ?? 0,
                        }));
                      const extraWithQty = (extraQuantityRows ?? [])
                        .filter((row) => (row.quantity ?? 0) > 0)
                        .map((row) => ({
                          key: `${EXTRA_ROW_KEY_PREFIX}${row.id}`,
                          sizeLabel: row.size,
                          quantity: row.quantity ?? 0,
                        }));
                      const locationRows = [...fixedWithQty, ...extraWithQty];
                      const locationBySize = field.state.value ?? {};

                      const clearAllLocations = () => {
                        const next: Record<string, LocationEntry> = {};
                        for (const row of locationRows) {
                          next[row.key] = { ...DEFAULT_LOCATION };
                        }
                        field.handleChange(next);
                      };

                      const getLocation = (key: string) =>
                        locationBySize[key] ?? { ...DEFAULT_LOCATION };

                      const setLocation = (
                        key: string,
                        locKey: keyof LocationEntry,
                        value: string
                      ) => {
                        const prev = getLocation(key);
                        field.handleChange({
                          ...locationBySize,
                          [key]: { ...prev, [locKey]: value },
                        });
                      };

                      return (
                        <Card className="overflow-hidden">
                          <CardHeader className="space-y-1.5 pb-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="space-y-1.5">
                                <CardTitle className="font-custom text-foreground text-xl font-semibold">
                                  Enter Address (CH FL R)
                                </CardTitle>
                                <p className="font-custom text-muted-foreground text-sm">
                                  Assign chamber, floor and row for each size
                                  (including extra size rows) for detailed
                                  tracking.
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearAllLocations}
                                className="font-custom text-muted-foreground hover:text-foreground shrink-0"
                              >
                                Clear All
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {locationRows.map((row, index) => {
                              const loc = getLocation(row.key);
                              const allFilled =
                                Boolean(loc.chamber?.trim()) &&
                                Boolean(loc.floor?.trim()) &&
                                Boolean(loc.row?.trim());
                              const combined = allFilled
                                ? `${loc.chamber.trim()}-${loc.floor.trim()}-${loc.row.trim()}`
                                : null;
                              const anyFilled =
                                !!loc.chamber?.trim() ||
                                !!loc.floor?.trim() ||
                                !!loc.row?.trim();
                              const combinedLabel = combined
                                ? combined
                                : anyFilled
                                  ? 'Enter all fields'
                                  : '-';
                              return (
                                <div key={row.key}>
                                  {index > 0 && <Separator className="mb-6" />}
                                  <div className="space-y-4">
                                    <h3 className="font-custom text-foreground text-base font-semibold">
                                      {row.sizeLabel} – {row.quantity} bags
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                      <Field>
                                        <FieldLabel className="font-custom text-foreground mb-2 block text-base font-semibold">
                                          Chamber
                                        </FieldLabel>
                                        <Input
                                          value={loc.chamber}
                                          onChange={(e) =>
                                            setLocation(
                                              row.key,
                                              'chamber',
                                              e.target.value.toUpperCase()
                                            )
                                          }
                                          placeholder="e.g. A"
                                          className="font-custom"
                                        />
                                      </Field>
                                      <Field>
                                        <FieldLabel className="font-custom text-foreground mb-2 block text-base font-semibold">
                                          Floor
                                        </FieldLabel>
                                        <Input
                                          value={loc.floor}
                                          onChange={(e) =>
                                            setLocation(
                                              row.key,
                                              'floor',
                                              e.target.value.toUpperCase()
                                            )
                                          }
                                          placeholder="e.g. 1"
                                          className="font-custom"
                                        />
                                      </Field>
                                      <Field>
                                        <FieldLabel className="font-custom text-foreground mb-2 block text-base font-semibold">
                                          Row
                                        </FieldLabel>
                                        <Input
                                          value={loc.row}
                                          onChange={(e) =>
                                            setLocation(
                                              row.key,
                                              'row',
                                              e.target.value.toUpperCase()
                                            )
                                          }
                                          placeholder="e.g. R1"
                                          className="font-custom"
                                        />
                                      </Field>
                                    </div>
                                    <div className="border-border/60 bg-muted/30 flex flex-col gap-2 rounded-md border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                                      <span className="font-custom text-muted-foreground text-base font-normal">
                                        Combined Location
                                      </span>
                                      <span
                                        className={`font-custom text-base font-medium sm:text-right ${combined ? 'text-foreground' : 'text-muted-foreground'}`}
                                      >
                                        {combinedLabel}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      );
                    }}
                  </form.Subscribe>
                )}
              />
              <form.Field
                name="remarks"
                children={(field) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      Remarks
                    </FieldLabel>
                    <textarea
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="border-input bg-background text-foreground font-custom placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background w-full rounded-md border p-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      rows={4}
                    />
                  </Field>
                )}
              />
            </>
          )}
        </FieldGroup>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="font-custom"
              >
                Back
              </Button>
            )}
            {step === 1 && !isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="font-custom"
              >
                Reset
              </Button>
            )}
          </div>
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="font-custom px-8 font-bold"
            disabled={step === 2 ? isSubmitting : false}
          >
            {step === 1
              ? 'Next'
              : isEditMode
                ? isSubmitting
                  ? 'Saving…'
                  : 'Save'
                : isSubmitting
                  ? 'Submitting…'
                  : 'Review'}
          </Button>
        </div>
      </form>

      {!isEditMode && (
        <IncomingSummarySheet
          open={summaryOpen}
          onOpenChange={setSummaryOpen}
          voucherNumberDisplay={voucherNumberDisplay}
          farmerDisplayName={farmerDisplayName}
          variety={formValues.variety}
          formValues={formValues}
          quantityRows={quantityRowsForSummary}
          sizeOrder={quantitySizes}
          totalRent={totalRentForSummary}
          isPending={isSubmitting}
          isLoadingVoucher={isLoadingVoucher}
          gatePassNo={gatePassNoForSummary}
          onSubmit={() => form.handleSubmit()}
        />
      )}
    </main>
  );
});
