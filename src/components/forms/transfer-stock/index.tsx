import { memo, useMemo, useRef, useState, type FormEvent } from 'react';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';
import { AddFarmerModal } from '@/components/forms/add-farmer-modal';
import { useGetAllFarmers } from '@/services/store-admin/functions/useGetAllFarmers';
import { DatePicker } from '@/components/forms/date-picker';
import { formatDate, payloadDateSchema } from '@/lib/helpers';
import { toast } from 'sonner';
import {
  useCreateTransferStock,
  type CreateTransferStockBody,
} from '@/services/transfer-stock/useCreateTransferStock';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';
import { useGetIncomingGatePassesOfSingleFarmer } from '@/services/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import { TransferVouchersSection } from './transfer-vouchers-section';
import { TransferSummarySheet } from './transfer-summary-sheet';
import { buildTransferPayload } from './transfer-form-utils';

type FieldErrors = Array<{ message?: string } | undefined>;

/* -------------------------------------------------
   Main form
-------------------------------------------------- */

type TransferFormValues = {
  fromFarmerStorageLinkId: string;
  toFarmerStorageLinkId: string;
  date: string;
  truckNumber: string;
  remarks: string;
};

const defaultValues: TransferFormValues = {
  fromFarmerStorageLinkId: '',
  toFarmerStorageLinkId: '',
  date: formatDate(new Date()),
  truckNumber: '',
  remarks: '',
};

export interface TransferStockFormProps {
  /** Optional existing daybook entry, for future edit mode support */
  editEntry?: DaybookEntry;
}

export const TransferStockForm = memo(function TransferStockForm() {
  const createTransferStock = useCreateTransferStock();

  const {
    data: farmerLinks,
    isLoading: isLoadingFarmers,
    refetch: refetchFarmers,
  } = useGetAllFarmers();

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

  const farmerLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of farmerOptions) {
      map.set(opt.value, opt.label);
    }
    return map;
  }, [farmerOptions]);

  const formSchema = useMemo(
    () =>
      z.object({
        fromFarmerStorageLinkId: z.string().min(1, 'Please select a From farmer'),
        toFarmerStorageLinkId: z.string().min(1, 'Please select a To farmer'),
        date: payloadDateSchema,
        truckNumber: z
          .string()
          .trim()
          .optional()
          .transform((val) => (val ? val.toUpperCase() : val)),
        remarks: z.string().max(500).default(''),
      }),
    []
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [cellQuantities, setCellQuantities] = useState<Record<string, number>>(
    {}
  );
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [pendingPayload, setPendingPayload] =
    useState<CreateTransferStockBody | null>(null);
  const openSheetRef = useRef(false);

  const [vouchersSectionKey, setVouchersSectionKey] = useState(0);

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: formSchema as never,
    },
    onSubmit: async ({ value }) => {
      if (step === 1) {
        setStep(2);
        return;
      }

      const { fromFarmerStorageLinkId, toFarmerStorageLinkId, date, truckNumber, remarks } =
        value;

      const payload = buildTransferPayload(
        {
          fromFarmerStorageLinkId,
          toFarmerStorageLinkId,
          date,
          truckNumber: truckNumber ?? undefined,
          remarks,
        },
        cellQuantities,
        incomingPasses
      );

      if (!payload) {
        toast.error('Please add at least one quantity', {
          description: 'Select quantities in the incoming gate passes table.',
        });
        return;
      }

      if (!openSheetRef.current) {
        openSheetRef.current = true;
        setPendingPayload(payload);
        setSummaryOpen(true);
        return;
      }

      openSheetRef.current = false;
      await createTransferStock.mutateAsync(payload);
      setSummaryOpen(false);
      setPendingPayload(null);
      setCellQuantities({});
      setStep(1);
      form.reset();
    },
  });

  const fromFarmerId =
    (form.state.values as { fromFarmerStorageLinkId?: string })
      .fromFarmerStorageLinkId ?? '';

  const toFarmerOptions: Option<string>[] = useMemo(
    () => farmerOptions.filter((opt) => opt.value !== fromFarmerId),
    [farmerOptions, fromFarmerId]
  );

  const { data: incomingPasses = [] } = useGetIncomingGatePassesOfSingleFarmer(
    fromFarmerId
  );

  const handleReview = (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit();
  };

  const handleFarmerAdded = () => {
    refetchFarmers();
  };

  return (
    <main className="font-custom mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-12">
      <div className="mb-8 space-y-4">
        <h1 className="font-custom text-foreground text-3xl font-bold sm:text-4xl">
          Transfer Stock
        </h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (step === 2) {
            handleReview(e);
          } else {
            setStep(2);
          }
        }}
        className="space-y-6"
      >
        <FieldGroup className="space-y-6">
          {step === 1 && (
            <>
              <form.Field
                name="fromFarmerStorageLinkId"
                children={(field) => {
                  const hasSubmitError = Boolean(
                    field.state.meta.errorMap &&
                      'onSubmit' in field.state.meta.errorMap &&
                      field.state.meta.errorMap.onSubmit
                  );
                  const invalidFromValidation =
                    hasSubmitError ||
                    (field.state.meta.isTouched && !field.state.meta.isValid);
                  const isInvalid =
                    invalidFromValidation && !field.state.value;
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <FieldLabel
                            htmlFor="transfer-from-farmer-select"
                            className="font-custom mb-2 block text-base font-semibold"
                          >
                            From farmer (search and select)
                          </FieldLabel>
                          <SearchSelector
                            id="transfer-from-farmer-select"
                            options={farmerOptions}
                            placeholder="Search or Create Farmer"
                            searchPlaceholder="Search by name, account number, or mobile..."
                            onSelect={(value) =>
                              form.setFieldValue(
                                'fromFarmerStorageLinkId' as never,
                                value as never
                              )
                            }
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
                          errors={field.state.meta.errors as FieldErrors}
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
                      id="transfer-date"
                      label="Date"
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                    />
                    {field.state.meta.isTouched && !field.state.meta.isValid && (
                      <FieldError
                        errors={field.state.meta.errors as FieldErrors}
                      />
                    )}
                  </Field>
                )}
              />

              <form.Subscribe
                selector={(state) => ({
                  fromFarmerStorageLinkId: state.values.fromFarmerStorageLinkId,
                })}
              >
                {({ fromFarmerStorageLinkId }) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      Incoming gate passes
                    </FieldLabel>
                    <TransferVouchersSection
                      key={`${fromFarmerStorageLinkId ?? ''}-${vouchersSectionKey}`}
                      farmerStorageLinkId={fromFarmerStorageLinkId ?? ''}
                      cellQuantities={cellQuantities}
                      setCellQuantities={setCellQuantities}
                    />
                  </Field>
                )}
              </form.Subscribe>
            </>
          )}

          {step === 2 && (
            <>
              <form.Field
                name="toFarmerStorageLinkId"
                children={(field) => {
                  const hasSubmitError = Boolean(
                    field.state.meta.errorMap &&
                      'onSubmit' in field.state.meta.errorMap &&
                      field.state.meta.errorMap.onSubmit
                  );
                  const invalidFromValidation =
                    hasSubmitError ||
                    (field.state.meta.isTouched && !field.state.meta.isValid);
                  const isInvalid =
                    invalidFromValidation && !field.state.value;
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <FieldLabel
                            htmlFor="transfer-to-farmer-select"
                            className="font-custom mb-2 block text-base font-semibold"
                          >
                            To farmer (search and select)
                          </FieldLabel>
                          <SearchSelector
                            id="transfer-to-farmer-select"
                            options={toFarmerOptions}
                            placeholder="Search Farmer"
                            searchPlaceholder="Search by name, account number, or mobile..."
                            onSelect={(value) =>
                              form.setFieldValue(
                                'toFarmerStorageLinkId' as never,
                                value as never
                              )
                            }
                            value={field.state.value}
                            loading={isLoadingFarmers}
                            loadingMessage="Loading farmers..."
                            emptyMessage="No farmers found"
                            buttonClassName="w-full justify-between"
                          />
                        </div>
                      </div>
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
                name="truckNumber"
                children={(field) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      Truck Number
                      <span className="font-custom text-muted-foreground ml-1 font-normal">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. PB10AB1234"
                      className="font-custom"
                    />
                  </Field>
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
            {step === 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setCellQuantities({});
                  setVouchersSectionKey((k) => k + 1);
                  setStep(1);
                }}
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
            disabled={createTransferStock.isPending}
          >
            {step === 1 ? 'Next' : createTransferStock.isPending ? 'Submitting…' : 'Review'}
          </Button>
        </div>
      </form>

      <TransferSummarySheet
        open={summaryOpen}
        onOpenChange={(open) => {
          if (!open) openSheetRef.current = false;
          setSummaryOpen(open);
        }}
        pendingPayload={pendingPayload}
        isSubmitting={createTransferStock.isPending}
        onConfirm={() => {
          if (!pendingPayload) return;
          createTransferStock.mutate(pendingPayload, {
            onSuccess: () => {
              setSummaryOpen(false);
              setPendingPayload(null);
              setCellQuantities({});
              setStep(1);
              form.reset();
            },
          });
        }}
        fromFarmerLabel={fromFarmerId ? farmerLabelById.get(fromFarmerId) : undefined}
        toFarmerLabel={
          (form.state.values as { toFarmerStorageLinkId?: string })
            .toFarmerStorageLinkId
            ? farmerLabelById.get(
                (form.state.values as { toFarmerStorageLinkId?: string })
                  .toFarmerStorageLinkId as string
              )
            : undefined
        }
      />
    </main>
  );
});

export default TransferStockForm;
