import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { IncomingGatePassItem } from '@/services/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import { OutgoingVouchersSection } from '@/components/forms/outgoing';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';
import { AddFarmerModal } from '@/components/forms/add-farmer-modal';
import { useGetAllFarmers } from '@/services/store-admin/functions/useGetAllFarmers';
import { DatePicker } from '@/components/forms/date-picker';
import { formatDate, payloadDateSchema } from '@/lib/helpers';
import { AutoScrollFormWrapper } from '@/components/forms/auto-scroll-form-wrapper';
import { TransferStockSummarySheet } from './transfer-stock-summary-sheet';
import { useGetIncomingGatePassesOfSingleFarmer } from '@/services/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import {
  buildTransferStockPayload,
  createTransferStockGatePassBodySchema,
  useCreateTransferStockGatePass,
  type CreateTransferStockGatePassBody,
} from '@/services/transfer-stock/useCreateTransferStockGatePass';
import { toast } from 'sonner';

type FieldErrors = Array<{ message?: string } | undefined>;

const defaultFormValues = {
  fromFarmerStorageLinkId: '',
  toFarmerStorageLinkId: '',
  date: formatDate(new Date()),
  truckNumber: '',
  remarks: '',
};

const step1Schema = z
  .object({
    fromFarmerStorageLinkId: z.string().min(1, 'Please select source farmer'),
    toFarmerStorageLinkId: z
      .string()
      .min(1, 'Please select destination farmer'),
    date: payloadDateSchema,
  })
  .refine((d) => d.fromFarmerStorageLinkId !== d.toFarmerStorageLinkId, {
    message: 'Source and destination must be different accounts',
    path: ['toFarmerStorageLinkId'],
  });

function TransferStockFormInner() {
  const {
    data: farmerLinks,
    isLoading: isLoadingFarmers,
    refetch: refetchFarmers,
  } = useGetAllFarmers();

  const createTransfer = useCreateTransferStockGatePass();

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

  const [step, setStep] = useState<1 | 2>(1);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [pendingPayload, setPendingPayload] =
    useState<CreateTransferStockGatePassBody | null>(null);
  const openSheetRef = useRef(false);
  const [cellRemovedQuantities, setCellRemovedQuantities] = useState<
    Record<string, number>
  >({});
  const [vouchersSectionKey, setVouchersSectionKey] = useState(0);
  const incomingPassesRef = useRef<IncomingGatePassItem[]>([]);

  const form = useForm({
    defaultValues: defaultFormValues,
    onSubmit: async ({ value }) => {
      if (!openSheetRef.current) return;
      openSheetRef.current = false;
      const built = buildTransferStockPayload(
        {
          fromFarmerStorageLinkId: value.fromFarmerStorageLinkId,
          toFarmerStorageLinkId: value.toFarmerStorageLinkId,
          date: value.date,
          truckNumber: value.truckNumber,
          remarks: value.remarks,
        },
        cellRemovedQuantities,
        incomingPassesRef.current
      );
      if (!built) {
        toast.error('Please add at least one allocation', {
          description: 'Select quantities in the incoming gate passes table.',
        });
        return;
      }
      const parsed = createTransferStockGatePassBodySchema.safeParse(built);
      if (!parsed.success) {
        const first =
          parsed.error.flatten().fieldErrors.truckNumber?.[0] ??
          parsed.error.flatten().fieldErrors.items?.[0] ??
          parsed.error.issues[0]?.message ??
          'Please check truck number and allocations';
        toast.error(first);
        return;
      }
      setPendingPayload(parsed.data);
      setSummaryOpen(true);
    },
  });

  const fromFarmerForPasses =
    form.state.values.fromFarmerStorageLinkId ?? '';
  const { data: incomingPasses = [] } =
    useGetIncomingGatePassesOfSingleFarmer(fromFarmerForPasses);

  useEffect(() => {
    incomingPassesRef.current = incomingPasses;
  }, [incomingPasses]);

  const handleFromFarmerSelect = (value: string) => {
    form.setFieldValue('fromFarmerStorageLinkId', value);
  };

  const handleToFarmerSelect = (value: string) => {
    form.setFieldValue('toFarmerStorageLinkId', value);
  };

  const handleFarmerAdded = () => {
    refetchFarmers();
  };

  const handleNextStep = () => {
    const v = form.state.values;
    const parsed = step1Schema.safeParse({
      fromFarmerStorageLinkId: v.fromFarmerStorageLinkId,
      toFarmerStorageLinkId: v.toFarmerStorageLinkId,
      date: v.date,
    });
    if (!parsed.success) {
      const first = parsed.error.flatten();
      const msg =
        first.fieldErrors.fromFarmerStorageLinkId?.[0] ??
        first.fieldErrors.toFarmerStorageLinkId?.[0] ??
        first.fieldErrors.date?.[0] ??
        first.formErrors[0] ??
        parsed.error.issues[0]?.message ??
        'Please fix step 1 fields';
      toast.error(msg);
      return;
    }
    const hasAllocation = Object.values(cellRemovedQuantities).some(
      (q) => q != null && q > 0
    );
    if (!hasAllocation) {
      toast.error('Please add at least one allocation', {
        description: 'Select quantities in the incoming gate passes table.',
      });
      return;
    }
    setStep(2);
  };

  const fromLabel =
    farmerOptions.find((o) => o.value === form.state.values.fromFarmerStorageLinkId)
      ?.label ?? '—';
  const toLabel =
    farmerOptions.find((o) => o.value === form.state.values.toFarmerStorageLinkId)
      ?.label ?? '—';

  const varietyByPassId = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of incomingPasses) {
      m[p._id] = p.variety?.trim() ?? '';
    }
    return m;
  }, [incomingPasses]);

  return (
    <main className="font-custom mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-12">
      <div className="mb-8 space-y-4">
        <h1 className="font-custom text-foreground text-3xl font-bold sm:text-4xl">
          Transfer stock
        </h1>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 1) {
            handleNextStep();
            return;
          }
          openSheetRef.current = true;
          void form.handleSubmit();
        }}
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
                            htmlFor="transfer-from-farmer"
                            className="font-custom mb-2 block text-base font-semibold"
                          >
                            From (source account)
                          </FieldLabel>
                          <SearchSelector
                            id="transfer-from-farmer"
                            options={farmerOptions}
                            placeholder="Search or create farmer"
                            searchPlaceholder="Search by name, account number, or mobile…"
                            onSelect={handleFromFarmerSelect}
                            value={field.state.value}
                            loading={isLoadingFarmers}
                            loadingMessage="Loading farmers…"
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
                      <FieldLabel
                        htmlFor="transfer-to-farmer"
                        className="font-custom mb-2 block text-base font-semibold"
                      >
                        To (destination account)
                      </FieldLabel>
                      <SearchSelector
                        id="transfer-to-farmer"
                        options={farmerOptions}
                        placeholder="Search or select farmer"
                        searchPlaceholder="Search by name, account number, or mobile…"
                        onSelect={handleToFarmerSelect}
                        value={field.state.value}
                        loading={isLoadingFarmers}
                        loadingMessage="Loading farmers…"
                        emptyMessage="No farmers found"
                        buttonClassName="w-full justify-between"
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
                name="date"
                children={(field) => (
                  <Field>
                    <DatePicker
                      id="transfer-stock-date"
                      label="Date"
                      labelClassName="font-custom mb-2 block text-base font-semibold"
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
                  fromFarmerStorageLinkId:
                    state.values.fromFarmerStorageLinkId,
                })}
              >
                {({ fromFarmerStorageLinkId }) =>
                  fromFarmerStorageLinkId ? (
                    <Field>
                      <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                        Incoming gate passes
                      </FieldLabel>
                      <OutgoingVouchersSection
                        key={`${fromFarmerStorageLinkId}-${vouchersSectionKey}`}
                        farmerStorageLinkId={fromFarmerStorageLinkId}
                        cellRemovedQuantities={cellRemovedQuantities}
                        setCellRemovedQuantities={setCellRemovedQuantities}
                      />
                    </Field>
                  ) : null
                }
              </form.Subscribe>
            </>
          )}

          {step === 2 && (
            <>
              <form.Field
                name="truckNumber"
                children={(field) => (
                  <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                    <FieldLabel
                      htmlFor="transfer-truck-number"
                      className="font-custom mb-2 block text-base font-semibold"
                    >
                      Truck number
                    </FieldLabel>
                    <input
                      id="transfer-truck-number"
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="border-input bg-background text-foreground font-custom placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background h-10 w-full rounded-md border px-3 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      placeholder="e.g. PB10AB1234"
                      autoComplete="off"
                    />
                    {field.state.meta.isTouched && !field.state.meta.isValid && (
                      <FieldError
                        errors={field.state.meta.errors as FieldErrors}
                      />
                    )}
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
                      placeholder="Optional notes for this transfer"
                    />
                    {field.state.meta.isTouched && !field.state.meta.isValid && (
                      <FieldError
                        errors={field.state.meta.errors as FieldErrors}
                      />
                    )}
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
                  setCellRemovedQuantities({});
                  setVouchersSectionKey((k) => k + 1);
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
            disabled={step === 2 ? createTransfer.isPending : false}
          >
            {step === 1
              ? 'Next'
              : createTransfer.isPending
                ? 'Submitting…'
                : 'Review'}
          </Button>
        </div>
      </form>

      <TransferStockSummarySheet
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        pendingPayload={pendingPayload}
        varietyByPassId={varietyByPassId}
        fromFarmerLabel={fromLabel}
        toFarmerLabel={toLabel}
        isSubmitting={createTransfer.isPending}
        onConfirm={() => {
          if (!pendingPayload) return;
          createTransfer.mutate(pendingPayload);
        }}
      />
    </main>
  );
}

/** Named export avoids default-export `undefined` during ESM circular init (TanStack route ↔ form). */
export const TransferStockForm = memo(function TransferStockForm() {
  return (
    <AutoScrollFormWrapper>
      <TransferStockFormInner />
    </AutoScrollFormWrapper>
  );
});

export default TransferStockForm;
