import { useMemo, useState } from 'react';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import type { IncomingFormApi } from '@/features/incoming/forms/use-incoming-form';
import {
  clearPaltaiLocations,
  createEmptyPaltaiLocationRow,
  pruneEmptyPaltaiLocationRows,
  quantityRowHasPaltaiValidationErrors,
  validatePaltaiLocationField,
  validatePaltaiLocationRow,
  type IncomingPaltaiLocationRow,
  type IncomingQuantityRow,
  type PaltaiLocationFieldName,
} from '@/features/incoming/schemas/incoming-quantities-schema';
import {
  getStorageLayoutFloors,
  withLegacyOption,
} from '@/features/auth/utils/storage-layout';
import type { StorageLayoutChamber } from '@/features/auth/types';
import { normalizeUppercase } from '@/lib/form-utils';
import { ChevronDown, MapPinned, Plus, Trash2 } from 'lucide-react';

type FieldMeta = {
  isTouched: boolean;
  isBlurred: boolean;
  isValid: boolean;
  errors: unknown[];
};

function getDisplayedFieldError(
  quantityRow: IncomingQuantityRow | undefined,
  paltaiIndex: number,
  field: PaltaiLocationFieldName,
  meta: FieldMeta,
  highlightValidationErrors: boolean,
): string | undefined {
  const validationError = validatePaltaiLocationField(quantityRow, paltaiIndex, field);
  const shouldShow = meta.isTouched || meta.isBlurred || highlightValidationErrors;

  if (!shouldShow) return undefined;
  if (validationError) return validationError;

  const firstMetaError = meta.errors[0];
  return typeof firstMetaError === 'string' ? firstMetaError : undefined;
}

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

type PaltaiLocationsPanelProps = {
  form: IncomingFormApi;
  quantityIndex: number;
  row: IncomingQuantityRow;
  useLayoutSelects: boolean;
  storageLayout: StorageLayoutChamber[] | null | undefined;
  chamberOptions: string[];
  highlightValidationErrors?: boolean;
};

function paltaiFieldListenTo(quantityIndex: number, paltaiIndex: number) {
  return [
    `quantities[${quantityIndex}].qty`,
    `quantities[${quantityIndex}].chamber`,
    `quantities[${quantityIndex}].floor`,
    `quantities[${quantityIndex}].row`,
    `quantities[${quantityIndex}].paltaiLocations[${paltaiIndex}].chamber`,
    `quantities[${quantityIndex}].paltaiLocations[${paltaiIndex}].floor`,
    `quantities[${quantityIndex}].paltaiLocations[${paltaiIndex}].row`,
  ] as const;
}

function createPaltaiFieldValidator(
  form: IncomingFormApi,
  quantityIndex: number,
  paltaiIndex: number,
  field: PaltaiLocationFieldName,
) {
  return () => {
    const quantityRow = form.getFieldValue(`quantities[${quantityIndex}]`);
    return validatePaltaiLocationField(quantityRow, paltaiIndex, field);
  };
}

export function PaltaiLocationsPanel({
  form,
  quantityIndex,
  row,
  useLayoutSelects,
  storageLayout,
  chamberOptions,
  highlightValidationErrors = false,
}: PaltaiLocationsPanelProps) {
  return (
    <form.Subscribe
      selector={(state) => ({
        paltaiLocations: state.values.quantities[quantityIndex]?.paltaiLocations ?? [],
        quantityRow: state.values.quantities[quantityIndex],
      })}
    >
      {({ paltaiLocations, quantityRow }) => {
        const hasPaltaiLocations = paltaiLocations.some(
          (entry) => entry.chamber !== '' || entry.floor !== '' || entry.row !== '',
        );
        const hasValidationErrors = quantityRowHasPaltaiValidationErrors(quantityRow);
        const sizeLabel = row.size || `row ${quantityIndex + 1}`;

        const updatePaltaiLocations = (next: IncomingPaltaiLocationRow[]) => {
          form.setFieldValue(`quantities[${quantityIndex}].paltaiLocations`, next);
        };

        const pruneEmptyRows = () => {
          const currentRow = form.getFieldValue(`quantities[${quantityIndex}]`) ?? row;
          const pruned = pruneEmptyPaltaiLocationRows(currentRow.paltaiLocations);
          if (pruned.length !== currentRow.paltaiLocations.length) {
            form.setFieldValue(`quantities[${quantityIndex}].paltaiLocations`, pruned);
          }
        };

        return (
          <details
            open={hasPaltaiLocations || hasValidationErrors || highlightValidationErrors}
            className="border-border/60 bg-muted/20 rounded-lg border"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-md">
                  <MapPinned className="size-3.5" aria-hidden />
                </span>
                {hasPaltaiLocations ? 'Edit paltai locations' : 'Add paltai locations'}
              </span>
              <span className="text-muted-foreground inline-flex items-center gap-2 text-xs">
                {hasValidationErrors ? (
                  <span className="text-destructive">Fix paltai errors</span>
                ) : hasPaltaiLocations ? (
                  `${paltaiLocations.length} location${paltaiLocations.length === 1 ? '' : 's'}`
                ) : (
                  'Optional'
                )}
                <ChevronDown className="size-4" aria-hidden />
              </span>
            </summary>

            <div className="border-border/60 border-t px-3 py-3">
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Paltai locations are optional. When you start one, chamber, floor, and row are all
                  required for that entry. Add entries in chronological order — the latest is used
                  for location analytics.
                </p>
                {hasPaltaiLocations ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      form.setFieldValue(
                        `quantities[${quantityIndex}]`,
                        clearPaltaiLocations(
                          form.getFieldValue(`quantities[${quantityIndex}]`) ?? row,
                        ),
                      )
                    }
                  >
                    Clear all
                  </Button>
                ) : null}
              </div>

              <div className="space-y-3">
                {paltaiLocations.map((paltaiRow, paltaiIndex) => {
                  const isLatest = paltaiIndex === paltaiLocations.length - 1;
                  const paltaiChamberOptions = withLegacyOption(
                    chamberOptions,
                    paltaiRow.chamber,
                  );
                  const paltaiFloorOptions = withLegacyOption(
                    getStorageLayoutFloors(storageLayout, paltaiRow.chamber),
                    paltaiRow.floor,
                  );
                  const rowErrors = validatePaltaiLocationRow(quantityRow, paltaiIndex);
                  const rowErrorMessage =
                    rowErrors.chamber && rowErrors.chamber.includes('Duplicate')
                      ? rowErrors.chamber
                      : null;

                  return (
                    <div
                      key={paltaiRow.id}
                      className="border-border/50 bg-background/60 rounded-lg border p-3"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                          Paltai {paltaiIndex + 1}
                          {isLatest && paltaiLocations.length > 1 ? (
                            <span className="text-primary ml-1.5">(latest)</span>
                          ) : null}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          aria-label={`Remove paltai location ${paltaiIndex + 1} for ${sizeLabel}`}
                          onClick={() => {
                            updatePaltaiLocations(
                              paltaiLocations.filter((entry) => entry.id !== paltaiRow.id),
                            );
                            pruneEmptyRows();
                          }}
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <form.Field
                          name={`quantities[${quantityIndex}].paltaiLocations[${paltaiIndex}].chamber`}
                          validators={{
                            onChangeListenTo: [...paltaiFieldListenTo(quantityIndex, paltaiIndex)],
                            onChange: createPaltaiFieldValidator(
                              form,
                              quantityIndex,
                              paltaiIndex,
                              'chamber',
                            ),
                            onBlur: createPaltaiFieldValidator(
                              form,
                              quantityIndex,
                              paltaiIndex,
                              'chamber',
                            ),
                          }}
                        >
                          {(subField) => {
                            const fieldError = getDisplayedFieldError(
                              quantityRow,
                              paltaiIndex,
                              'chamber',
                              subField.state.meta,
                              highlightValidationErrors,
                            );
                            const isInvalid = Boolean(fieldError);

                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={subField.name}>Chamber</FieldLabel>
                                {useLayoutSelects ? (
                                  <LocationOptionCombobox
                                    id={subField.name}
                                    name={subField.name}
                                    value={subField.state.value}
                                    onValueChange={(next) => {
                                      subField.handleChange(next);
                                      const floors = getStorageLayoutFloors(storageLayout, next);
                                      const currentFloor =
                                        form.getFieldValue(
                                          `quantities[${quantityIndex}].paltaiLocations[${paltaiIndex}].floor`,
                                        ) ?? '';
                                      if (currentFloor && !floors.includes(currentFloor)) {
                                        form.setFieldValue(
                                          `quantities[${quantityIndex}].paltaiLocations[${paltaiIndex}].floor`,
                                          '',
                                        );
                                      }
                                    }}
                                    onBlur={subField.handleBlur}
                                    isInvalid={isInvalid}
                                    optionValues={paltaiChamberOptions}
                                    placeholder="Select chamber"
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
                                    placeholder="Enter chamber"
                                    autoComplete="off"
                                    className="uppercase"
                                  />
                                )}
                                {isInvalid && <FieldError>{fieldError}</FieldError>}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field
                          name={`quantities[${quantityIndex}].paltaiLocations[${paltaiIndex}].floor`}
                          validators={{
                            onChangeListenTo: [...paltaiFieldListenTo(quantityIndex, paltaiIndex)],
                            onChange: createPaltaiFieldValidator(
                              form,
                              quantityIndex,
                              paltaiIndex,
                              'floor',
                            ),
                            onBlur: createPaltaiFieldValidator(
                              form,
                              quantityIndex,
                              paltaiIndex,
                              'floor',
                            ),
                          }}
                        >
                          {(subField) => {
                            const fieldError = getDisplayedFieldError(
                              quantityRow,
                              paltaiIndex,
                              'floor',
                              subField.state.meta,
                              highlightValidationErrors,
                            );
                            const isInvalid = Boolean(fieldError);

                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={subField.name}>Floor</FieldLabel>
                                {useLayoutSelects ? (
                                  <LocationOptionCombobox
                                    id={subField.name}
                                    name={subField.name}
                                    value={subField.state.value}
                                    onValueChange={subField.handleChange}
                                    onBlur={subField.handleBlur}
                                    isInvalid={isInvalid}
                                    optionValues={paltaiFloorOptions}
                                    placeholder="Select floor"
                                    popupSearchPlaceholder="Search floor..."
                                    emptyMessage="No floors found."
                                    disabled={!paltaiRow.chamber}
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
                                    placeholder="Enter floor"
                                    autoComplete="off"
                                    className="uppercase"
                                  />
                                )}
                                {isInvalid && <FieldError>{fieldError}</FieldError>}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field
                          name={`quantities[${quantityIndex}].paltaiLocations[${paltaiIndex}].row`}
                          validators={{
                            onChangeListenTo: [...paltaiFieldListenTo(quantityIndex, paltaiIndex)],
                            onChange: createPaltaiFieldValidator(
                              form,
                              quantityIndex,
                              paltaiIndex,
                              'row',
                            ),
                            onBlur: createPaltaiFieldValidator(
                              form,
                              quantityIndex,
                              paltaiIndex,
                              'row',
                            ),
                          }}
                        >
                          {(subField) => {
                            const fieldError = getDisplayedFieldError(
                              quantityRow,
                              paltaiIndex,
                              'row',
                              subField.state.meta,
                              highlightValidationErrors,
                            );
                            const isInvalid = Boolean(fieldError);

                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={subField.name}>Row</FieldLabel>
                                <Input
                                  id={subField.name}
                                  name={subField.name}
                                  value={subField.state.value}
                                  onBlur={subField.handleBlur}
                                  onChange={(e) =>
                                    subField.handleChange(normalizeUppercase(e.target.value))
                                  }
                                  aria-invalid={isInvalid}
                                  placeholder="Enter row"
                                  autoComplete="off"
                                  className="uppercase"
                                />
                                {isInvalid && <FieldError>{fieldError}</FieldError>}
                              </Field>
                            );
                          }}
                        </form.Field>
                      </div>

                      {rowErrorMessage &&
                      (highlightValidationErrors || hasValidationErrors) ? (
                        <p className="text-destructive mt-2 text-xs">{rowErrorMessage}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  updatePaltaiLocations([...paltaiLocations, createEmptyPaltaiLocationRow()])
                }
              >
                <Plus className="mr-2 size-3.5" aria-hidden />
                Add paltai
              </Button>
            </div>
          </details>
        );
      }}
    </form.Subscribe>
  );
}
