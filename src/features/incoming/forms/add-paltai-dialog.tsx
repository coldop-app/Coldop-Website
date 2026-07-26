import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import {
  getStorageLayoutChambers,
  getStorageLayoutFloors,
  hasStorageLayout,
  withLegacyOption,
} from '@/features/auth/utils/storage-layout';
import {
  hasCompleteIncomingQuantityLocation,
  type IncomingQuantityLocation,
  type IncomingQuantityRow,
} from '@/features/incoming/schemas/incoming-quantities-schema';
import { normalizeUppercase } from '@/lib/form-utils';

const locationInputClass =
  'h-8 px-1.5 text-xs placeholder:text-xs sm:h-9 sm:px-3 sm:text-sm sm:placeholder:text-sm text-center uppercase';

function toComboboxOptions(values: string[]): ComboboxOption[] {
  return values.map((value) => ({ id: value, label: value }));
}

function formatLocation(location: IncomingQuantityLocation) {
  return [location.chamber, location.floor, location.row].filter(Boolean).join(' / ') || '—';
}

type LocationOptionComboboxProps = {
  id: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
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
      onBlur={() => undefined}
      isInvalid={false}
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

type AddPaltaiDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bagSizeLabel: string;
  currentChamber: string;
  currentFloor: string;
  previousLocation: IncomingQuantityRow['previousLocation'];
  onConfirm: (nextLocation: IncomingQuantityLocation) => void;
};

function createPrefillLocation(chamber: string, floor: string): IncomingQuantityLocation {
  return {
    chamber,
    floor,
    row: '',
  };
}

export function AddPaltaiDialog({
  open,
  onOpenChange,
  bagSizeLabel,
  currentChamber,
  currentFloor,
  previousLocation,
  onConfirm,
}: AddPaltaiDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AddPaltaiDialogContent
          bagSizeLabel={bagSizeLabel}
          currentChamber={currentChamber}
          currentFloor={currentFloor}
          previousLocation={previousLocation}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
        />
      ) : null}
    </Dialog>
  );
}

type AddPaltaiDialogContentProps = {
  bagSizeLabel: string;
  currentChamber: string;
  currentFloor: string;
  previousLocation: IncomingQuantityRow['previousLocation'];
  onOpenChange: (open: boolean) => void;
  onConfirm: (nextLocation: IncomingQuantityLocation) => void;
};

function AddPaltaiDialogContent({
  bagSizeLabel,
  currentChamber,
  currentFloor,
  previousLocation,
  onOpenChange,
  onConfirm,
}: AddPaltaiDialogContentProps) {
  const storageLayout = useColdStorageStore((state) => state.coldStorage?.storageLayout);
  const useLayoutSelects = hasStorageLayout(storageLayout);
  const chamberOptions = getStorageLayoutChambers(storageLayout);

  const [nextLocation, setNextLocation] = useState<IncomingQuantityLocation>(() =>
    createPrefillLocation(currentChamber, currentFloor),
  );

  useEffect(() => {
    setNextLocation(createPrefillLocation(currentChamber, currentFloor));
  }, [bagSizeLabel, currentChamber, currentFloor]);

  const canConfirm = hasCompleteIncomingQuantityLocation(nextLocation);
  const history = previousLocation ?? [];

  return (
    <DialogContent className="sm:max-w-lg" showCloseButton>
      <DialogHeader>
        <DialogTitle>Add Paltai location</DialogTitle>
        <DialogDescription>
          Move {bagSizeLabel || 'this bag size'} to a new chamber, floor, and row. The current
          location is saved in history.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground text-sm font-medium">Location history</h3>
            {history.length > 0 ? (
              <Badge variant="secondary" className="tabular-nums">
                {history.length}
              </Badge>
            ) : null}
          </div>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">No previous locations yet.</p>
          ) : (
            <div className="border-border overflow-hidden rounded-lg border">
              <div className="bg-muted/50 text-muted-foreground grid grid-cols-3 gap-2 px-3 py-2 text-xs font-medium">
                <span>Chamber</span>
                <span>Floor</span>
                <span>Row</span>
              </div>
              <ul className="divide-border divide-y">
                {history.map((location, index) => (
                  <li
                    key={`${location.chamber}-${location.floor}-${location.row}-${index}`}
                    className="grid grid-cols-3 gap-2 px-3 py-2 text-sm tabular-nums"
                  >
                    <span>{location.chamber || '—'}</span>
                    <span>{location.floor || '—'}</span>
                    <span>{location.row || '—'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-foreground text-sm font-medium">New Paltai location</h3>
          <div className="grid grid-cols-3 gap-2">
            <Field>
              <FieldLabel htmlFor="add-paltai-chamber">Chamber</FieldLabel>
              {useLayoutSelects ? (
                <LocationOptionCombobox
                  id="add-paltai-chamber"
                  name="add-paltai-chamber"
                  value={nextLocation.chamber}
                  onValueChange={(chamber) => {
                    const floors = getStorageLayoutFloors(storageLayout, chamber);
                    setNextLocation((prev) => ({
                      chamber,
                      floor: prev.floor && floors.includes(prev.floor) ? prev.floor : '',
                      row: prev.row,
                    }));
                  }}
                  optionValues={withLegacyOption(chamberOptions, nextLocation.chamber)}
                  placeholder="Ch"
                  popupSearchPlaceholder="Search chamber..."
                  emptyMessage="No chambers found."
                />
              ) : (
                <Input
                  id="add-paltai-chamber"
                  name="add-paltai-chamber"
                  value={nextLocation.chamber}
                  onChange={(e) =>
                    setNextLocation((prev) => ({
                      ...prev,
                      chamber: normalizeUppercase(e.target.value),
                    }))
                  }
                  placeholder="Ch"
                  autoComplete="off"
                  className={locationInputClass}
                />
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="add-paltai-floor">Floor</FieldLabel>
              {useLayoutSelects ? (
                <LocationOptionCombobox
                  id="add-paltai-floor"
                  name="add-paltai-floor"
                  value={nextLocation.floor}
                  onValueChange={(floor) => setNextLocation((prev) => ({ ...prev, floor }))}
                  optionValues={withLegacyOption(
                    getStorageLayoutFloors(storageLayout, nextLocation.chamber),
                    nextLocation.floor,
                  )}
                  placeholder="Fl"
                  popupSearchPlaceholder="Search floor..."
                  emptyMessage="No floors found."
                  disabled={!nextLocation.chamber}
                />
              ) : (
                <Input
                  id="add-paltai-floor"
                  name="add-paltai-floor"
                  value={nextLocation.floor}
                  onChange={(e) =>
                    setNextLocation((prev) => ({
                      ...prev,
                      floor: normalizeUppercase(e.target.value),
                    }))
                  }
                  placeholder="Fl"
                  autoComplete="off"
                  className={locationInputClass}
                />
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="add-paltai-row">Row</FieldLabel>
              <Input
                id="add-paltai-row"
                name="add-paltai-row"
                value={nextLocation.row}
                onChange={(e) =>
                  setNextLocation((prev) => ({
                    ...prev,
                    row: normalizeUppercase(e.target.value),
                  }))
                }
                placeholder="R"
                autoComplete="off"
                className={locationInputClass}
              />
            </Field>
          </div>
          {canConfirm ? (
            <p className="text-muted-foreground text-xs">
              Moving to {formatLocation(nextLocation)}.
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              Chamber and floor are prefilled from the current location. Enter a new row to confirm
              the move.
            </p>
          )}
        </section>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!canConfirm}
          onClick={() => {
            if (!canConfirm) return;
            onConfirm(nextLocation);
            onOpenChange(false);
          }}
        >
          Save Paltai
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
