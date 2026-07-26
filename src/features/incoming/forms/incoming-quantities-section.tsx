import { useMemo, useState } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import * as z from 'zod';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import { BagSizeSelectField, FixedBagSizeLabel } from '@/components/bag-quantity-size-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import {
  getStorageLayoutChambers,
  getStorageLayoutFloors,
  hasStorageLayout,
  withLegacyOption,
} from '@/features/auth/utils/storage-layout';
import { AddPaltaiDialog } from '@/features/incoming/forms/add-paltai-dialog';
import type { IncomingFormApi } from '@/features/incoming/forms/use-incoming-form';
import { useCompleteLocationOrder } from '@/features/incoming/forms/use-complete-location-order';
import {
  applyIncomingPaltaiLocation,
  applyIncomingQuantityLocationToAll,
  createDefaultIncomingQuantities,
  createEmptyIncomingQuantityRow,
  incomingQuantityRowSchema,
  type IncomingQuantityRow,
} from '@/features/incoming/schemas/incoming-quantities-schema';
import type { FarmerStorageLink } from '@/features/people/types';
import { formatInr } from '@/features/finances/shared/format-currency';
import { numericInputProps, normalizeUppercase, parseOptionalNumber } from '@/lib/form-utils';

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

const compactInputClass =
  'h-8 px-1.5 text-xs placeholder:text-xs sm:h-9 sm:px-3 sm:text-sm sm:placeholder:text-sm';

const locationInputClass = `${compactInputClass} text-center uppercase`;

function toComboboxOptions(values: string[]): ComboboxOption[] {
  return values.map((value) => ({ id: value, label: value }));
}

type LocationOptionComboboxProps = {
  id: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  onBlur: () => void;
  isInvalid: boolean;
  optionValues: string[];
  placeholder: string;
  popupSearchPlaceholder: string;
  emptyMessage: string;
  disabled?: boolean;
};

function LocationOptionCombobox({
  id,
  name,
  value,
  onValueChange,
  onBlur,
  isInvalid,
  optionValues,
  placeholder,
  popupSearchPlaceholder,
  emptyMessage,
  disabled = false,
}: LocationOptionComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const options = useMemo(() => toComboboxOptions(optionValues), [optionValues]);
  const sortedOptions = useMemo(() => filterAndSortOptions(search, options), [search, options]);

  return (
    <SearchableOptionCombobox
      id={id}
      name={name}
      value={value}
      onValueChange={onValueChange}
      onBlur={onBlur}
      isInvalid={isInvalid}
      placeholder={placeholder}
      popupSearchPlaceholder={popupSearchPlaceholder}
      emptyMessage={emptyMessage}
      options={options}
      sortedOptions={sortedOptions}
      search={search}
      setSearch={setSearch}
      open={open}
      setOpen={setOpen}
      disabled={disabled}
    />
  );
}

type IncomingQuantitiesSectionProps = {
  form: IncomingFormApi;
  bagSizes: string[];
  farmerStorageLinks: FarmerStorageLink[];
  enablePaltai?: boolean;
};

type QuantitiesBulkActionsProps = {
  form: IncomingFormApi;
  quantities: IncomingQuantityRow[];
  bagSizes: string[];
  onAddRow: () => void;
};

function QuantitiesBulkActionsContent({
  form,
  quantities,
  bagSizes,
  onAddRow,
}: QuantitiesBulkActionsProps) {
  const { sourceRow, canApplyToAll, resetCompletionOrder } = useCompleteLocationOrder(quantities);

  return (
    <div className="border-border flex flex-wrap gap-3 border-t px-2 py-3 sm:px-3">
      <Button type="button" variant="outline" onClick={onAddRow}>
        <Plus className="mr-2 size-4" aria-hidden />
        Add more
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={!canApplyToAll}
        title={canApplyToAll ? undefined : 'Enter chamber, floor, and row in one line to enable'}
        onClick={() => {
          if (!sourceRow) return;
          form.setFieldValue(
            'quantities',
            applyIncomingQuantityLocationToAll(quantities, {
              chamber: sourceRow.chamber,
              floor: sourceRow.floor,
              row: sourceRow.row,
            }),
          );
        }}
      >
        <Copy className="mr-2 size-4" aria-hidden />
        Apply to all
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          resetCompletionOrder();
          form.setFieldValue('quantities', createDefaultIncomingQuantities(bagSizes));
        }}
      >
        Clear quantities
      </Button>
    </div>
  );
}

function QuantitiesBulkActions({
  form,
  bagSizes,
  onAddRow,
}: Omit<QuantitiesBulkActionsProps, 'quantities'>) {
  return (
    <form.Subscribe selector={(state) => state.values.quantities}>
      {(quantities) => (
        <QuantitiesBulkActionsContent
          form={form}
          quantities={quantities}
          bagSizes={bagSizes}
          onAddRow={onAddRow}
        />
      )}
    </form.Subscribe>
  );
}

export function IncomingQuantitiesSection({
  form,
  bagSizes,
  farmerStorageLinks,
  enablePaltai = false,
}: IncomingQuantitiesSectionProps) {
  const storageLayout = useColdStorageStore((state) => state.coldStorage?.storageLayout);
  const useLayoutSelects = hasStorageLayout(storageLayout);
  const chamberOptions = getStorageLayoutChambers(storageLayout);
  const [paltaiRowIndex, setPaltaiRowIndex] = useState<number | null>(null);

  const allowedSizeSchema = z
    .string()
    .refine((value) => value !== '', 'Select a bag size.')
    .refine(
      (value) => bagSizes.length === 0 || bagSizes.includes(value),
      'Select a valid bag size.',
    );

  const sizeColClass = enablePaltai ? 'col-span-2' : 'col-span-3';
  const qtyColClass = enablePaltai ? 'col-span-2' : 'col-span-3';
  const locationColClass = 'col-span-2';
  const paltaiColClass = 'col-span-2';

  return (
    <FieldSet>
      <FieldLegend className="font-heading text-base font-semibold">Enter Quantities</FieldLegend>
      <FieldDescription>
        Enter bag counts by size and assign chamber, floor, and row for each line. Use Add more for
        another row with the same size but a different location. Use Apply to all to copy the first
        completed location to every row. Rows with zero or empty quantity are ignored on submit.
        {enablePaltai
          ? ' Use Add Paltai to move stock to a new location and keep the previous location in history.'
          : null}
      </FieldDescription>

      <div className="border-border mt-5 overflow-x-auto rounded-lg border">
        <div className="border-border bg-muted/50 grid grid-cols-12 gap-1 border-b px-2 py-2 sm:gap-2 sm:px-3 sm:py-2.5">
          <div className={`text-muted-foreground ${sizeColClass} text-xs font-medium sm:text-sm`}>
            Size
          </div>
          <div className={`text-muted-foreground ${qtyColClass} text-xs font-medium sm:text-sm`}>
            Qty
          </div>
          <div
            className={`text-muted-foreground ${locationColClass} text-center text-xs font-medium sm:text-left sm:text-sm`}
          >
            <span className="sm:hidden">Ch</span>
            <span className="hidden sm:inline">Chamber</span>
          </div>
          <div
            className={`text-muted-foreground ${locationColClass} text-center text-xs font-medium sm:text-left sm:text-sm`}
          >
            <span className="sm:hidden">Fl</span>
            <span className="hidden sm:inline">Floor</span>
          </div>
          <div
            className={`text-muted-foreground ${locationColClass} text-center text-xs font-medium sm:text-left sm:text-sm`}
          >
            <span className="sm:hidden">R</span>
            <span className="hidden sm:inline">Row</span>
          </div>
          {enablePaltai ? (
            <div
              className={`text-muted-foreground ${paltaiColClass} text-center text-xs font-medium sm:text-left sm:text-sm`}
            >
              Paltai
            </div>
          ) : null}
        </div>

        <form.Field name="quantities" mode="array">
          {(field) => {
            const paltaiRow =
              paltaiRowIndex != null ? (field.state.value[paltaiRowIndex] ?? null) : null;

            return (
            <>
              <div className="divide-border divide-y">
                {field.state.value.map((row, index) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-12 items-start gap-1 px-2 py-2 sm:gap-2 sm:px-3 sm:py-2.5"
                  >
                    <div className={`${sizeColClass} min-w-0`}>
                      {row.isExtra ? (
                        <form.Field
                          name={`quantities[${index}].size`}
                          validators={{ onChange: allowedSizeSchema }}
                        >
                          {(subField) => (
                            <BagSizeSelectField
                              id={subField.name}
                              name={subField.name}
                              value={subField.state.value}
                              rowIndex={index}
                              sizes={bagSizes}
                              labelClassName="sr-only"
                              triggerClassName="h-8 px-1.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
                              isInvalid={isFieldInvalid(subField.state.meta)}
                              errors={subField.state.meta.errors}
                              onBlur={subField.handleBlur}
                              onValueChange={subField.handleChange}
                            />
                          )}
                        </form.Field>
                      ) : (
                        <FixedBagSizeLabel size={row.size} rowIndex={index} />
                      )}
                    </div>

                    <div className={qtyColClass}>
                      <form.Field
                        name={`quantities[${index}].qty`}
                        validators={{
                          onChange: incomingQuantityRowSchema.shape.qty,
                        }}
                      >
                        {(subField) => {
                          const isInvalid = isFieldInvalid(subField.state.meta);
                          const sizeLabel = row.size || `row ${index + 1}`;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={subField.name} className="sr-only">
                                Qty ({sizeLabel})
                              </FieldLabel>
                              <Input
                                {...numericInputProps}
                                id={subField.name}
                                name={subField.name}
                                inputMode="numeric"
                                placeholder="Qty"
                                value={subField.state.value ?? ''}
                                onBlur={subField.handleBlur}
                                onChange={(e) =>
                                  subField.handleChange(parseOptionalNumber(e.target.value))
                                }
                                aria-invalid={isInvalid}
                                className={`${compactInputClass} tabular-nums`}
                              />
                              {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </div>

                    <div className={locationColClass}>
                      <form.Field
                        name={`quantities[${index}].chamber`}
                        validators={{
                          onChange: incomingQuantityRowSchema.shape.chamber,
                        }}
                      >
                        {(subField) => {
                          const isInvalid = isFieldInvalid(subField.state.meta);
                          const sizeLabel = row.size || `row ${index + 1}`;
                          const options = withLegacyOption(chamberOptions, subField.state.value);

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={subField.name} className="sr-only">
                                Chamber ({sizeLabel})
                              </FieldLabel>
                              {useLayoutSelects ? (
                                <LocationOptionCombobox
                                  id={subField.name}
                                  name={subField.name}
                                  value={subField.state.value}
                                  onValueChange={(next) => {
                                    subField.handleChange(next);
                                    const floors = getStorageLayoutFloors(storageLayout, next);
                                    const currentFloor =
                                      form.getFieldValue(`quantities[${index}].floor`) ?? '';
                                    if (currentFloor && !floors.includes(currentFloor)) {
                                      form.setFieldValue(`quantities[${index}].floor`, '');
                                    }
                                  }}
                                  onBlur={subField.handleBlur}
                                  isInvalid={isInvalid}
                                  optionValues={options}
                                  placeholder="Ch"
                                  popupSearchPlaceholder="Search chamber..."
                                  emptyMessage="No chambers found."
                                />
                              ) : (
                                <Input
                                  id={subField.name}
                                  name={subField.name}
                                  value={subField.state.value}
                                  onBlur={subField.handleBlur}
                                  onChange={(e) =>
                                    subField.handleChange(normalizeUppercase(e.target.value))
                                  }
                                  aria-invalid={isInvalid}
                                  placeholder="Ch"
                                  autoComplete="off"
                                  className={locationInputClass}
                                />
                              )}
                              {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </div>

                    <div className={locationColClass}>
                      <form.Subscribe
                        selector={(state) => state.values.quantities[index]?.chamber ?? ''}
                      >
                        {(selectedChamber) => (
                          <form.Field
                            name={`quantities[${index}].floor`}
                            validators={{
                              onChange: incomingQuantityRowSchema.shape.floor,
                            }}
                          >
                            {(subField) => {
                              const isInvalid = isFieldInvalid(subField.state.meta);
                              const sizeLabel = row.size || `row ${index + 1}`;
                              const floorOptions = withLegacyOption(
                                getStorageLayoutFloors(storageLayout, selectedChamber),
                                subField.state.value,
                              );

                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel htmlFor={subField.name} className="sr-only">
                                    Floor ({sizeLabel})
                                  </FieldLabel>
                                  {useLayoutSelects ? (
                                    <LocationOptionCombobox
                                      id={subField.name}
                                      name={subField.name}
                                      value={subField.state.value}
                                      onValueChange={subField.handleChange}
                                      onBlur={subField.handleBlur}
                                      isInvalid={isInvalid}
                                      optionValues={floorOptions}
                                      placeholder="Fl"
                                      popupSearchPlaceholder="Search floor..."
                                      emptyMessage="No floors found."
                                      disabled={!selectedChamber}
                                    />
                                  ) : (
                                    <Input
                                      id={subField.name}
                                      name={subField.name}
                                      value={subField.state.value}
                                      onBlur={subField.handleBlur}
                                      onChange={(e) =>
                                        subField.handleChange(normalizeUppercase(e.target.value))
                                      }
                                      aria-invalid={isInvalid}
                                      placeholder="Fl"
                                      autoComplete="off"
                                      className={locationInputClass}
                                    />
                                  )}
                                  {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                                </Field>
                              );
                            }}
                          </form.Field>
                        )}
                      </form.Subscribe>
                    </div>

                    <div className={locationColClass}>
                      <form.Field
                        name={`quantities[${index}].row`}
                        validators={{
                          onChange: incomingQuantityRowSchema.shape.row,
                        }}
                      >
                        {(subField) => {
                          const isInvalid = isFieldInvalid(subField.state.meta);
                          const sizeLabel = row.size || `row ${index + 1}`;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={subField.name} className="sr-only">
                                Row ({sizeLabel})
                              </FieldLabel>
                              <div className={row.isExtra ? 'flex items-start gap-1' : undefined}>
                                <Input
                                  id={subField.name}
                                  name={subField.name}
                                  value={subField.state.value}
                                  onBlur={subField.handleBlur}
                                  onChange={(e) =>
                                    subField.handleChange(normalizeUppercase(e.target.value))
                                  }
                                  aria-invalid={isInvalid}
                                  placeholder="R"
                                  autoComplete="off"
                                  className={
                                    row.isExtra
                                      ? `${locationInputClass} min-w-0 flex-1`
                                      : locationInputClass
                                  }
                                />
                                {row.isExtra ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="size-8 shrink-0 sm:size-9"
                                    aria-label={`Remove row ${index + 1}`}
                                    onClick={() => field.removeValue(index)}
                                  >
                                    <Trash2 className="size-3.5 sm:size-4" aria-hidden />
                                  </Button>
                                ) : null}
                              </div>
                              {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </div>

                    {enablePaltai ? (
                      <div className={paltaiColClass}>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 w-full px-1.5 text-xs sm:h-9 sm:px-2 sm:text-sm"
                          disabled={(row.qty ?? 0) <= 0}
                          onClick={() => setPaltaiRowIndex(index)}
                        >
                          <span className="truncate">Add Paltai</span>
                          {(row.previousLocation?.length ?? 0) > 0 ? (
                            <Badge
                              variant="secondary"
                              className="ml-1 shrink-0 px-1.5 py-0 text-[10px] tabular-nums"
                            >
                              {row.previousLocation.length}
                            </Badge>
                          ) : null}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <QuantitiesBulkActions
                form={form}
                bagSizes={bagSizes}
                onAddRow={() => field.pushValue(createEmptyIncomingQuantityRow())}
              />

              {enablePaltai ? (
                <AddPaltaiDialog
                  open={paltaiRowIndex != null && paltaiRow != null}
                  onOpenChange={(open) => {
                    if (!open) setPaltaiRowIndex(null);
                  }}
                  bagSizeLabel={paltaiRow?.size ?? ''}
                  currentChamber={paltaiRow?.chamber ?? ''}
                  currentFloor={paltaiRow?.floor ?? ''}
                  previousLocation={paltaiRow?.previousLocation ?? []}
                  onConfirm={(nextLocation) => {
                    if (paltaiRowIndex == null) return;
                    const current = field.state.value[paltaiRowIndex];
                    if (!current) return;
                    const nextRows = [...field.state.value];
                    nextRows[paltaiRowIndex] = applyIncomingPaltaiLocation(current, nextLocation);
                    form.setFieldValue('quantities', nextRows);
                  }}
                />
              ) : null}
            </>
            );
          }}
        </form.Field>
      </div>

      <form.Subscribe
        selector={(state) => ({
          quantities: state.values.quantities,
          farmerIncomingLinkId: state.values.farmerIncomingLinkId,
        })}
        children={({ quantities, farmerIncomingLinkId }) => {
          const totalBags = quantities.reduce((sum, row) => sum + (row.qty ?? 0), 0);
          const selectedFarmer = farmerStorageLinks.find(
            (link) => link._id === farmerIncomingLinkId,
          );
          const costPerBag = selectedFarmer?.costPerBag;
          const showTotalRent = Boolean(farmerIncomingLinkId) && typeof costPerBag === 'number';
          const totalRent = showTotalRent ? totalBags * costPerBag : 0;

          return (
            <div className="divide-border border-border bg-muted/30 mt-4 divide-y rounded-lg border">
              <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
                <span className="text-foreground text-sm font-semibold">Total bags</span>
                <span className="font-heading text-foreground text-xl font-semibold tabular-nums">
                  {totalBags.toLocaleString('en-IN')}
                </span>
              </div>
              {showTotalRent ? (
                <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
                  <span className="text-foreground text-sm font-semibold">Total rent</span>
                  <div className="shrink-0 text-right">
                    <span className="font-heading text-foreground block text-xl font-semibold tabular-nums">
                      {formatInr(totalRent)}
                    </span>
                    <span className="text-muted-foreground mt-0.5 block text-xs tabular-nums">
                      ({totalBags.toLocaleString('en-IN')} × {formatInr(costPerBag)})
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          );
        }}
      />
    </FieldSet>
  );
}
