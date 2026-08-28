import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DatePickerInput } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import {
  getLabourExpenseDialogLines,
  type LabourExpenseDialogLine,
} from '@/features/auth/utils/labour-expenses';
import { useCreateLabourExpense } from '@/features/finances/api/use-create-labour-expense';
import { formatInr } from '@/features/finances/shared/format-currency';

import {
  buildLabourExpenseCreatePayload,
  roundLabourExpenseAmount,
} from './build-labour-expense-create-payload';

const labourExpenseRowGridClass =
  'grid grid-cols-[2.5rem_minmax(8rem,1fr)_6rem_6rem_9rem_7rem] items-center gap-2 px-3';

const bagCountInputProps = {
  type: 'number' as const,
  min: 0,
  step: 1,
  inputMode: 'numeric' as const,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

const rateInputProps = {
  type: 'number' as const,
  min: 0,
  step: 0.01,
  inputMode: 'decimal' as const,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

type BagCounts = {
  leno: string;
  jute: string;
  lenoRate: string;
  juteRate: string;
  narration: string;
};

const emptyBagCounts = (): BagCounts => ({
  leno: '',
  jute: '',
  lenoRate: '',
  juteRate: '',
  narration: '',
});

const emptyBags = (lineIds: string[]): Record<string, BagCounts> =>
  Object.fromEntries(lineIds.map((id) => [id, emptyBagCounts()]));

const emptyForm = (lineIds: string[] = []) => ({
  date: new Date().toISOString(),
  bags: emptyBags(lineIds),
});

const parseAmount = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const lineRates = (line: LabourExpenseDialogLine, counts: BagCounts | undefined) => {
  const lenoRate = line.manualRate ? parseAmount(counts?.lenoRate ?? '') : line.lenoRate;
  const juteRate = line.manualRate ? parseAmount(counts?.juteRate ?? '') : line.juteRate;

  return { lenoRate, juteRate };
};

const lineTotal = (line: LabourExpenseDialogLine, counts: BagCounts | undefined): number => {
  if (!counts) {
    return 0;
  }

  const { lenoRate, juteRate } = lineRates(line, counts);

  return parseAmount(counts.leno) * lenoRate + parseAmount(counts.jute) * juteRate;
};

const formatTotal = (value: number): string => {
  if (!value) {
    return '';
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
};

const formatPreferenceRates = (line: LabourExpenseDialogLine): string =>
  `${line.lenoRate} / ${line.juteRate}`;

function LabourExpenseRateFields({
  line,
  counts,
  onRateChange,
  desktop = false,
}: {
  line: LabourExpenseDialogLine;
  counts: BagCounts | undefined;
  onRateChange: (field: 'lenoRate' | 'juteRate', value: string) => void;
  desktop?: boolean;
}) {
  if (!line.manualRate) {
    return (
      <Input
        id={`add-labour-expense-${line.id}-rate${desktop ? '-desktop' : ''}`}
        value={formatPreferenceRates(line)}
        readOnly
        tabIndex={-1}
        aria-label={`${line.label} Leno and Jute rates`}
        className={desktop ? 'bg-muted/50 h-8 min-w-0 tabular-nums' : 'bg-muted/50 tabular-nums'}
      />
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-2 gap-1">
      <Input
        id={`add-labour-expense-${line.id}-leno-rate${desktop ? '-desktop' : ''}`}
        aria-label={`${line.label} Leno rate`}
        value={counts?.lenoRate ?? ''}
        onChange={(event) => onRateChange('lenoRate', event.target.value)}
        placeholder="Leno"
        className={desktop ? 'h-8 tabular-nums' : 'tabular-nums'}
        {...rateInputProps}
      />
      <Input
        id={`add-labour-expense-${line.id}-jute-rate${desktop ? '-desktop' : ''}`}
        aria-label={`${line.label} Jute rate`}
        value={counts?.juteRate ?? ''}
        onChange={(event) => onRateChange('juteRate', event.target.value)}
        placeholder="Jute"
        className={desktop ? 'h-8 tabular-nums' : 'tabular-nums'}
        {...rateInputProps}
      />
    </div>
  );
}

function OtherLabourExpenseNarrationField({
  line,
  value,
  onChange,
  desktop = false,
}: {
  line: LabourExpenseDialogLine;
  value: string;
  onChange: (value: string) => void;
  desktop?: boolean;
}) {
  const fieldId = `add-labour-expense-${line.id}-narration${desktop ? '-desktop' : ''}`;

  return (
    <Field className="gap-1">
      <FieldLabel htmlFor={fieldId} className="text-muted-foreground text-xs font-normal">
        Optional narration
      </FieldLabel>
      <Input
        id={fieldId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Note for ${line.label}`}
        className="h-8"
      />
    </Field>
  );
}

type AddLabourExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddLabourExpenseDialog({ open, onOpenChange }: AddLabourExpenseDialogProps) {
  const preferences = usePreferencesStore((state) => state.preferences);
  const lines = useMemo(() => getLabourExpenseDialogLines(preferences), [preferences]);
  const lineIds = useMemo(() => lines.map((line) => line.id), [lines]);
  const [form, setForm] = useState(() => emptyForm(lineIds));
  const { mutateAsync: createLabourExpense, isPending } = useCreateLabourExpense();

  const summary = useMemo(() => {
    const items = lines
      .map((line) => {
        const counts = form.bags[line.id];
        const leno = parseAmount(counts?.leno ?? '');
        const jute = parseAmount(counts?.jute ?? '');

        return {
          id: line.id,
          label: line.label,
          leno,
          jute,
          total: lineTotal(line, counts),
        };
      })
      .filter((item) => item.leno > 0 || item.jute > 0 || item.total > 0);

    return {
      items,
      totalLeno: items.reduce((sum, item) => sum + item.leno, 0),
      totalJute: items.reduce((sum, item) => sum + item.jute, 0),
      grandTotal: items.reduce((sum, item) => sum + item.total, 0),
    };
  }, [form.bags, lines]);

  const payloadRows = useMemo(
    () =>
      lines.map((line) => {
        const counts = form.bags[line.id];
        const { lenoRate, juteRate } = lineRates(line, counts);

        return {
          label: line.label,
          debitLedgerId: line.debitLedgerId,
          total: lineTotal(line, counts),
          lenoBags: parseAmount(counts?.leno ?? ''),
          juteBags: parseAmount(counts?.jute ?? ''),
          lenoRate,
          juteRate,
          ...(line.manualRate ? { narration: counts?.narration } : {}),
        };
      }),
    [form.bags, lines],
  );

  const hasQualifyingDebits = payloadRows.some(
    (row) => roundLabourExpenseAmount(row.total) >= 0.01,
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setForm(emptyForm(lineIds));
    onOpenChange(nextOpen);
  };

  const handleBagChange = (lineId: string, field: keyof BagCounts, value: string) => {
    setForm((current) => ({
      ...current,
      bags: {
        ...current.bags,
        [lineId]: {
          ...(current.bags[lineId] ?? emptyBagCounts()),
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = buildLabourExpenseCreatePayload({
      date: form.date,
      rows: payloadRows,
    });

    if (!result.ok) {
      toast.error(result.error, { position: 'bottom-right' });
      return;
    }

    try {
      const data = await createLabourExpense(result.payload);
      toast.success(data.message ?? 'Labour expense vouchers created successfully', {
        position: 'bottom-right',
      });
      handleOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create labour expense vouchers',
        { position: 'bottom-right' },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Add Labour expense
          </DialogTitle>
          <DialogDescription>
            Daily paledar work report — bag counts by Leno and Jute, with rate and total.
          </DialogDescription>
        </DialogHeader>

        <form id="add-labour-expense-form" noValidate onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <div className="max-w-sm">
              <DatePickerInput
                id="add-labour-expense-date"
                label="Date"
                value={form.date ? new Date(form.date) : undefined}
                onChange={(date) =>
                  setForm((current) => ({
                    ...current,
                    date: date ? date.toISOString() : '',
                  }))
                }
                placeholder="Pick a date"
              />
            </div>

            {lines.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No labour expense activities are configured in preferences.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 lg:hidden">
                  {lines.map((line) => (
                    <div key={line.id} className="bg-muted/40 rounded-xl border p-3">
                      <p className="mb-2 text-sm font-medium">
                        {line.number} {line.label}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Field>
                          <FieldLabel htmlFor={`add-labour-expense-${line.id}-leno`}>
                            Leno
                          </FieldLabel>
                          <Input
                            id={`add-labour-expense-${line.id}-leno`}
                            value={form.bags[line.id]?.leno ?? ''}
                            onChange={(event) =>
                              handleBagChange(line.id, 'leno', event.target.value)
                            }
                            placeholder="0"
                            className="tabular-nums"
                            {...bagCountInputProps}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`add-labour-expense-${line.id}-jute`}>
                            Jute
                          </FieldLabel>
                          <Input
                            id={`add-labour-expense-${line.id}-jute`}
                            value={form.bags[line.id]?.jute ?? ''}
                            onChange={(event) =>
                              handleBagChange(line.id, 'jute', event.target.value)
                            }
                            placeholder="0"
                            className="tabular-nums"
                            {...bagCountInputProps}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`add-labour-expense-${line.id}-rate`}>
                            Rate
                          </FieldLabel>
                          <LabourExpenseRateFields
                            line={line}
                            counts={form.bags[line.id]}
                            onRateChange={(field, value) =>
                              handleBagChange(line.id, field, value)
                            }
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`add-labour-expense-${line.id}-total`}>
                            Total
                          </FieldLabel>
                          <Input
                            id={`add-labour-expense-${line.id}-total`}
                            value={formatTotal(lineTotal(line, form.bags[line.id]))}
                            readOnly
                            tabIndex={-1}
                            placeholder="0"
                            className="bg-muted/50 tabular-nums"
                          />
                        </Field>
                      </div>
                      {line.manualRate ? (
                        <div className="border-border mt-2 border-l-2 pl-3">
                          <OtherLabourExpenseNarrationField
                            line={line}
                            value={form.bags[line.id]?.narration ?? ''}
                            onChange={(value) => handleBagChange(line.id, 'narration', value)}
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="border-border hidden overflow-hidden rounded-xl border lg:block">
                  <div className="bg-muted/50 border-border border-b py-3">
                    <div className={labourExpenseRowGridClass}>
                      <p className="text-muted-foreground text-sm font-medium">#</p>
                      <p className="text-muted-foreground text-sm font-medium">Description</p>
                      <p className="text-muted-foreground text-sm font-medium">Leno</p>
                      <p className="text-muted-foreground text-sm font-medium">Jute</p>
                      <p className="text-muted-foreground text-sm font-medium">Rate</p>
                      <p className="text-muted-foreground text-sm font-medium">Total</p>
                    </div>
                  </div>

                  <div className="divide-border divide-y">
                    {lines.map((line) => (
                      <div key={line.id}>
                        <div className={`${labourExpenseRowGridClass} py-2`}>
                          <p className="text-muted-foreground text-right text-sm tabular-nums">
                            {line.number}
                          </p>
                          <p className="text-sm">{line.label}</p>
                          <Input
                            id={`add-labour-expense-${line.id}-leno-desktop`}
                            aria-label={`${line.label} Leno`}
                            value={form.bags[line.id]?.leno ?? ''}
                            onChange={(event) =>
                              handleBagChange(line.id, 'leno', event.target.value)
                            }
                            placeholder="0"
                            className="h-8 min-w-0 tabular-nums"
                            {...bagCountInputProps}
                          />
                          <Input
                            id={`add-labour-expense-${line.id}-jute-desktop`}
                            aria-label={`${line.label} Jute`}
                            value={form.bags[line.id]?.jute ?? ''}
                            onChange={(event) =>
                              handleBagChange(line.id, 'jute', event.target.value)
                            }
                            placeholder="0"
                            className="h-8 min-w-0 tabular-nums"
                            {...bagCountInputProps}
                          />
                          <LabourExpenseRateFields
                            line={line}
                            counts={form.bags[line.id]}
                            onRateChange={(field, value) =>
                              handleBagChange(line.id, field, value)
                            }
                            desktop
                          />
                          <Input
                            id={`add-labour-expense-${line.id}-total-desktop`}
                            aria-label={`${line.label} Total`}
                            value={formatTotal(lineTotal(line, form.bags[line.id]))}
                            readOnly
                            tabIndex={-1}
                            placeholder="0"
                            className="bg-muted/50 h-8 min-w-0 tabular-nums"
                          />
                        </div>
                        {line.manualRate ? (
                          <div className={`${labourExpenseRowGridClass} items-start pb-2.5`}>
                            <span aria-hidden className="block" />
                            <div className="col-span-5 min-w-0">
                              <OtherLabourExpenseNarrationField
                                line={line}
                                value={form.bags[line.id]?.narration ?? ''}
                                onChange={(value) =>
                                  handleBagChange(line.id, 'narration', value)
                                }
                                desktop
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-border bg-muted/30 rounded-xl border p-3 sm:p-4">
                  <p className="font-heading text-sm font-semibold">Summary</p>
                  {summary.items.length === 0 ? (
                    <p className="text-muted-foreground mt-2 text-sm">No bags entered yet.</p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {summary.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <span className="min-w-0">
                            {item.label}
                            <span className="text-muted-foreground">
                              {' '}
                              ({item.leno} Leno, {item.jute} Jute)
                            </span>
                          </span>
                          <span className="shrink-0 tabular-nums">{formatInr(item.total)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="border-border mt-3 flex flex-col gap-1 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground text-sm">
                      {summary.totalLeno} Leno, {summary.totalJute} Jute
                    </p>
                    <p className="text-sm font-semibold">
                      Grand total{' '}
                      <span className="tabular-nums">{formatInr(summary.grandTotal)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </FieldGroup>
        </form>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-labour-expense-form"
            disabled={lines.length === 0 || !hasQualifyingDebits || isPending}
          >
            {isPending ? 'Adding…' : 'Add Expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
