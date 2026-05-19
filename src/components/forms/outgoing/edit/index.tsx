import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';

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
import { useGetIncomingGatePassesOfSingleFarmer } from '@/services/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import { OutgoingVouchersSection } from '@/components/forms/outgoing';
import { OutgoingSummarySheet } from '@/components/forms/outgoing/outgoing-summary-sheet';
import { DatePicker } from '@/components/forms/date-picker';
import {
  buildEditRestoreFromEntry,
  buildInitialAllocationsFromEntry,
  mergePassesForEdit,
} from '@/components/forms/outgoing/outgoing-form-utils';
import { buildEditOutgoingGatePassPayload } from '@/components/forms/outgoing/outgoing-payload';
import {
  getOutgoingFormValuesFromEntry,
  manualParchiNumberToString,
  outgoingFormSchema,
} from '@/components/forms/outgoing/outgoing-form-shared';
import { useEditOutgoingGatePass } from '@/services/outgoing-gate-pass/useEditOutgoingGatePass';
import type { EditOutgoingGatePassBody } from '@/services/outgoing-gate-pass/useEditOutgoingGatePass';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';

type FieldErrors = Array<{ message?: string } | undefined>;

export interface OutgoingEditFormProps {
  editEntry: DaybookEntry;
  editId: string;
}

export const OutgoingEditForm = memo(function OutgoingEditForm({
  editEntry,
  editId,
}: OutgoingEditFormProps) {
  const voucherNumberDisplay =
    editEntry.gatePassNo != null ? `#${editEntry.gatePassNo}` : '—';

  const editRestore = useMemo(
    () => buildEditRestoreFromEntry(editEntry),
    [editEntry]
  );

  const initialAllocations = useMemo(
    () => buildInitialAllocationsFromEntry(editEntry),
    [editEntry]
  );

  const {
    data: farmerLinks,
    isLoading: isLoadingFarmers,
    refetch: refetchFarmers,
  } = useGetAllFarmers();

  const [cellRemovedQuantities, setCellRemovedQuantities] = useState<
    Record<string, number>
  >(() => initialAllocations);

  const updateOutgoing = useEditOutgoingGatePass();

  const [pendingPayload, setPendingPayload] =
    useState<EditOutgoingGatePassBody | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [vouchersSectionKey, setVouchersSectionKey] = useState(0);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const openSheetRef = useRef(false);

  const form = useForm({
    defaultValues: getOutgoingFormValuesFromEntry(editEntry),
    validators: {
      onSubmit: outgoingFormSchema as never,
    },
    onSubmit: async ({ value }) => {
      if (openSheetRef.current) {
        openSheetRef.current = false;
        // cellRemovedQuantities holds absolute totals per line; payload lists the
        // full desired incomingGatePasses set (omitted passes are dropped on save).
        const payload = buildEditOutgoingGatePassPayload(
          {
            farmerStorageLinkId: value.farmerStorageLinkId,
            orderDate: value.orderDate,
            from: value.from,
            to: value.to,
            truckNumber: value.truckNumber?.trim() || undefined,
            remarks: value.remarks,
            manualParchiNumber:
              manualParchiNumberToString(value.manualParchiNumber) || undefined,
          },
          cellRemovedQuantities,
          mergedPasses
        );
        if (!payload) {
          toast.error('Please add at least one allocation', {
            description: 'Select quantities in the gate passes table.',
          });
          return;
        }
        setPendingPayload(payload);
        setSummaryOpen(true);
      }
    },
  });

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

  const handleStepNext = () => {
    const v = form.state.values;
    if (!v.farmerStorageLinkId?.trim()) {
      toast.error('Please select a farmer');
      return;
    }
    const mp = manualParchiNumberToString(v.manualParchiNumber);
    if (
      mp !== '' &&
      (!/^\d+$/.test(mp) || Number.parseInt(mp, 10) <= 0)
    ) {
      toast.error('Manual parchi number must be a positive integer');
      return;
    }
    const hasAllocation = Object.values(cellRemovedQuantities).some(
      (q) => q != null && q > 0
    );
    if (!hasAllocation) {
      toast.error('Please add at least one allocation', {
        description: 'Select quantities in the gate passes table.',
      });
      return;
    }
    setCreateStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepBack = () => {
    setCreateStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const runPrimaryAction = () => {
    if (createStep === 1) {
      handleStepNext();
      return;
    }
    openSheetRef.current = true;
    void form.handleSubmit();
  };

  const farmerStorageLinkIdForPasses =
    (form.state.values as { farmerStorageLinkId?: string })
      .farmerStorageLinkId ?? '';

  const { data: livePasses = [] } = useGetIncomingGatePassesOfSingleFarmer(
    farmerStorageLinkIdForPasses
  );

  const mergedPasses = useMemo(() => {
    if (!editRestore?.snapshotPasses.length) return livePasses;
    return mergePassesForEdit(livePasses, editRestore.snapshotPasses);
  }, [livePasses, editRestore]);

  const handleReset = useCallback(() => {
    form.reset(getOutgoingFormValuesFromEntry(editEntry));
    setCellRemovedQuantities(initialAllocations);
    setVouchersSectionKey((k) => k + 1);
    setCreateStep(1);
  }, [editEntry, form, initialAllocations]);

  const handleConfirmUpdate = useCallback(() => {
    if (!pendingPayload) return;
    updateOutgoing.mutate(
      { id: editId, payload: pendingPayload },
      {
        onSuccess: () => {
          setSummaryOpen(false);
          setPendingPayload(null);
        },
      }
    );
  }, [editId, pendingPayload, updateOutgoing]);

  return (
    <main className="font-custom mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-12">
      <div className="mb-8 space-y-4">
        <h1 className="font-custom text-foreground text-3xl font-bold sm:text-4xl">
          Edit Outgoing Gate Pass
        </h1>

        <div className="bg-primary/20 inline-block rounded-full px-4 py-1.5">
          <span className="font-custom text-primary text-sm font-medium">
            GATE PASS NO: {voucherNumberDisplay}
          </span>
        </div>

        <p className="font-custom text-muted-foreground text-sm">
          Step {createStep} of 2 —{' '}
          {createStep === 1
            ? 'Parchi, order date, farmer, and gate passes'
            : 'Route, truck, and remarks'}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runPrimaryAction();
        }}
        className="space-y-6"
      >
        <FieldGroup className="space-y-6">
          {createStep === 1 && (
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
                      autoFocus
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. 123"
                      className="font-custom"
                    />
                  </Field>
                )}
              />

              <form.Field
                name="orderDate"
                children={(field) => (
                  <Field>
                    <DatePicker
                      id="outgoing-edit-order-date"
                      label="Order Date"
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
                            htmlFor="outgoing-edit-farmer-select"
                            className="font-custom mb-2 block text-base font-semibold"
                          >
                            Enter Account Name (search and select)
                          </FieldLabel>
                          <SearchSelector
                            id="outgoing-edit-farmer-select"
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
                          errors={field.state.meta.errors as FieldErrors}
                        />
                      )}
                    </Field>
                  );
                }}
              />
            </>
          )}

          {createStep === 2 && (
            <>
              <form.Field
                name="from"
                children={(field) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      From
                      <span className="font-custom text-muted-foreground ml-1 font-normal">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Cold Storage"
                      className="font-custom"
                    />
                  </Field>
                )}
              />

              <form.Field
                name="to"
                children={(field) => (
                  <Field>
                    <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                      To
                      <span className="font-custom text-muted-foreground ml-1 font-normal">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Customer"
                      className="font-custom"
                    />
                  </Field>
                )}
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
                      placeholder="e.g. MH-12-AB-1234"
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

          {createStep === 1 && (
            <form.Subscribe
              selector={(state) => ({
                farmerStorageLinkId: state.values.farmerStorageLinkId,
              })}
            >
              {({ farmerStorageLinkId }) => (
                <Field>
                  <FieldLabel className="font-custom mb-2 block text-base font-semibold">
                    Incoming gate passes
                  </FieldLabel>
                  <OutgoingVouchersSection
                    key={`${farmerStorageLinkId ?? ''}-${vouchersSectionKey}`}
                    farmerStorageLinkId={farmerStorageLinkId ?? ''}
                    cellRemovedQuantities={cellRemovedQuantities}
                    setCellRemovedQuantities={setCellRemovedQuantities}
                    editRestore={editRestore}
                    allowZeroStockCells
                    initialCellRemovedQuantities={initialAllocations}
                  />
                </Field>
              )}
            </form.Subscribe>
          )}
        </FieldGroup>

        <div className="flex flex-wrap items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="font-custom"
          >
            Reset
          </Button>

          {createStep === 2 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleStepBack}
              className="font-custom"
            >
              Back
            </Button>
          )}

          {createStep === 1 ? (
            <Button
              type="button"
              variant="default"
              size="lg"
              className="font-custom px-8 font-bold"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleStepNext();
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="lg"
              className="font-custom px-8 font-bold"
              onClick={runPrimaryAction}
            >
              Review
            </Button>
          )}
        </div>
      </form>

      <OutgoingSummarySheet
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        pendingPayload={pendingPayload}
        mode="edit"
        gatePassNoDisplay={editEntry.gatePassNo}
        incomingPasses={mergedPasses}
        isSubmitting={updateOutgoing.isPending}
        onConfirm={handleConfirmUpdate}
      />
    </main>
  );
});

export default OutgoingEditForm;
