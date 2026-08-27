import { useState } from 'react';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  rate: string;
};

type LabourExpenseLine = {
  id: string;
  number: string;
  label: string;
};

const LABOUR_EXPENSE_LINES: LabourExpenseLine[] = [
  { id: 'bagsStored', number: '1.', label: 'Bags Stored' },
  { id: 'bagsNikas', number: '2.', label: 'Bags Nikas' },
  { id: 'bagsRestore', number: '3.', label: 'Bags Restore' },
  { id: 'bagsCatching', number: '4.', label: 'Bags Catching' },
  { id: 'stackingDhank', number: '5.', label: 'Stacking/Dhank' },
  { id: 'weighmentTotal', number: '6.', label: 'Weighment/Total' },
  { id: 'stitchingTanka', number: '7.', label: 'Stitching/Tanka' },
  { id: 'mCuttingShedPaltai', number: '8.', label: 'M-Cutting & Shed Paltai' },
  { id: 'bagsPaltaiAiration', number: '9.', label: 'Bags Paltai/Airation' },
  { id: 'shiftingChToCh', number: '10.', label: 'Shifting Ch. to Ch.' },
  { id: 'shiftingFloorToFloor', number: '11.', label: 'Shifting Floor to Floor' },
  { id: 'truckLoad', number: '12.', label: 'Truck Load' },
  { id: 'truckUnload', number: '13.', label: 'Truck Unload' },
  { id: 'trolleyLoad', number: '14.', label: 'Trolley Load' },
  { id: 'trolleyUnload', number: '15.', label: 'Trolley Unload' },
  { id: 'outsideArrivalLoadUnload', number: '16.', label: 'Outside Arrival Load/Unload' },
  { id: 'dala', number: '17.', label: 'Dala' },
  { id: 'otherExpenses', number: '18.', label: 'Other Expenses' },
];

const emptyBagCounts = (): BagCounts => ({ leno: '', jute: '', rate: '' });

const emptyBags = (): Record<string, BagCounts> =>
  Object.fromEntries(LABOUR_EXPENSE_LINES.map((line) => [line.id, emptyBagCounts()]));

const emptyForm = () => ({
  date: new Date().toISOString(),
  bags: emptyBags(),
});

const parseAmount = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const lineTotal = (counts: BagCounts | undefined): number => {
  if (!counts) {
    return 0;
  }

  return (parseAmount(counts.leno) + parseAmount(counts.jute)) * parseAmount(counts.rate);
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

type AddLabourExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddLabourExpenseDialog({ open, onOpenChange }: AddLabourExpenseDialogProps) {
  const [form, setForm] = useState(emptyForm);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setForm(emptyForm());
    }

    onOpenChange(nextOpen);
  };

  const handleBagChange = (lineId: string, field: keyof BagCounts, value: string) => {
    setForm((current) => ({
      ...current,
      bags: {
        ...current.bags,
        [lineId]: {
          ...current.bags[lineId],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Labour expense', {
      date: form.date,
      bags: form.bags,
    });
    handleOpenChange(false);
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

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 lg:hidden">
                {LABOUR_EXPENSE_LINES.map((line) => (
                  <div key={line.id} className="bg-muted/40 rounded-xl border p-3">
                    <p className="mb-2 text-sm font-medium">
                      {line.number} {line.label}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Field>
                        <FieldLabel htmlFor={`add-labour-expense-${line.id}-leno`}>Leno</FieldLabel>
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
                        <FieldLabel htmlFor={`add-labour-expense-${line.id}-jute`}>Jute</FieldLabel>
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
                        <FieldLabel htmlFor={`add-labour-expense-${line.id}-rate`}>Rate</FieldLabel>
                        <Input
                          id={`add-labour-expense-${line.id}-rate`}
                          value={form.bags[line.id]?.rate ?? ''}
                          onChange={(event) =>
                            handleBagChange(line.id, 'rate', event.target.value)
                          }
                          placeholder="0"
                          className="tabular-nums"
                          {...rateInputProps}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`add-labour-expense-${line.id}-total`}>
                          Total
                        </FieldLabel>
                        <Input
                          id={`add-labour-expense-${line.id}-total`}
                          value={formatTotal(lineTotal(form.bags[line.id]))}
                          readOnly
                          tabIndex={-1}
                          placeholder="0"
                          className="bg-muted/50 tabular-nums"
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-border hidden overflow-hidden rounded-xl border lg:block">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground w-12 px-3">#</TableHead>
                      <TableHead className="text-muted-foreground px-3">Description</TableHead>
                      <TableHead className="text-muted-foreground w-24 px-3 text-right">
                        Leno
                      </TableHead>
                      <TableHead className="text-muted-foreground w-24 px-3 text-right">
                        Jute
                      </TableHead>
                      <TableHead className="text-muted-foreground w-24 px-3 text-right">
                        Rate
                      </TableHead>
                      <TableHead className="text-muted-foreground w-28 px-3 text-right">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {LABOUR_EXPENSE_LINES.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="text-muted-foreground w-12 px-3 py-2 text-right tabular-nums">
                          {line.number}
                        </TableCell>
                        <TableCell className="whitespace-normal px-3 py-2">{line.label}</TableCell>
                        <TableCell className="w-24 px-3 py-2">
                          <Input
                            id={`add-labour-expense-${line.id}-leno-desktop`}
                            aria-label={`${line.label} Leno`}
                            value={form.bags[line.id]?.leno ?? ''}
                            onChange={(event) =>
                              handleBagChange(line.id, 'leno', event.target.value)
                            }
                            placeholder="0"
                            className="h-8 tabular-nums"
                            {...bagCountInputProps}
                          />
                        </TableCell>
                        <TableCell className="w-24 px-3 py-2">
                          <Input
                            id={`add-labour-expense-${line.id}-jute-desktop`}
                            aria-label={`${line.label} Jute`}
                            value={form.bags[line.id]?.jute ?? ''}
                            onChange={(event) =>
                              handleBagChange(line.id, 'jute', event.target.value)
                            }
                            placeholder="0"
                            className="h-8 tabular-nums"
                            {...bagCountInputProps}
                          />
                        </TableCell>
                        <TableCell className="w-24 px-3 py-2">
                          <Input
                            id={`add-labour-expense-${line.id}-rate-desktop`}
                            aria-label={`${line.label} Rate`}
                            value={form.bags[line.id]?.rate ?? ''}
                            onChange={(event) =>
                              handleBagChange(line.id, 'rate', event.target.value)
                            }
                            placeholder="0"
                            className="h-8 tabular-nums"
                            {...rateInputProps}
                          />
                        </TableCell>
                        <TableCell className="w-28 px-3 py-2">
                          <Input
                            id={`add-labour-expense-${line.id}-total-desktop`}
                            aria-label={`${line.label} Total`}
                            value={formatTotal(lineTotal(form.bags[line.id]))}
                            readOnly
                            tabIndex={-1}
                            placeholder="0"
                            className="bg-muted/50 h-8 tabular-nums"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </FieldGroup>
        </form>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="add-labour-expense-form">
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
