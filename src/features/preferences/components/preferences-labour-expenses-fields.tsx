import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { PreferencesFormApi } from '../forms/use-preferences-form';
import { emptyLabourExpenseRate } from '../schemas/preferences-form-schema';

type PreferencesLabourExpensesFieldsProps = {
  form: PreferencesFormApi;
};

const rateRowGridClass =
  'grid grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_2.25rem] items-start gap-2';

const numberInputProps = {
  type: 'number' as const,
  min: 0,
  step: 0.01,
  inputMode: 'decimal' as const,
  onWheel: (event: React.WheelEvent<HTMLInputElement>) => event.currentTarget.blur(),
};

function parseNonNegativeNumber(value: string) {
  if (value === '') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function PreferencesLabourExpensesFields({ form }: PreferencesLabourExpensesFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <form.Field name="labourExpenses.enabled">
        {(field) => (
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor={field.name}>Labour expenses</FieldLabel>
              <FieldDescription>
                Show the Add Labour Expense action on vouchers when enabled
              </FieldDescription>
            </FieldContent>
            <Switch
              id={field.name}
              checked={field.state.value === true}
              onCheckedChange={(checked) => field.handleChange(checked)}
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="labourExpenses.rates" mode="array">
        {(listField) => {
          const listInvalid = listField.state.meta.isTouched && !listField.state.meta.isValid;
          const rates = listField.state.value ?? [];

          return (
            <Field data-invalid={listInvalid}>
              <FieldLabel>Rates</FieldLabel>
              <FieldDescription>
                Add an activity name with Leno and Jute rates. Names are stored as typed, for
                example bagsStored.
              </FieldDescription>

              <div className="flex flex-col gap-2">
                {rates.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No rates added yet.</p>
                ) : (
                  <>
                    <div className={rateRowGridClass}>
                      <p className="text-foreground text-sm font-medium">Activity</p>
                      <p className="text-foreground text-sm font-medium">Leno</p>
                      <p className="text-foreground text-sm font-medium">Jute</p>
                      <div className="size-9" aria-hidden />
                    </div>

                    {rates.map((_, itemIndex) => (
                      <div key={itemIndex} className={rateRowGridClass}>
                        <form.Field name={`labourExpenses.rates[${itemIndex}].key`}>
                          {(itemField) => {
                            const isInvalid =
                              itemField.state.meta.isTouched && !itemField.state.meta.isValid;

                            return (
                              <Field data-invalid={isInvalid} className="min-w-0 gap-1">
                                <FieldLabel htmlFor={itemField.name} className="sr-only">
                                  Activity {itemIndex + 1}
                                </FieldLabel>
                                <Input
                                  id={itemField.name}
                                  name={itemField.name}
                                  value={itemField.state.value ?? ''}
                                  onBlur={itemField.handleBlur}
                                  onChange={(event) => itemField.handleChange(event.target.value)}
                                  placeholder="e.g. bagsStored"
                                  aria-invalid={isInvalid}
                                  className="w-full text-base"
                                />
                                {isInvalid && <FieldError errors={itemField.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name={`labourExpenses.rates[${itemIndex}].leno`}>
                          {(itemField) => {
                            const isInvalid =
                              itemField.state.meta.isTouched && !itemField.state.meta.isValid;

                            return (
                              <Field data-invalid={isInvalid} className="gap-1">
                                <FieldLabel htmlFor={itemField.name} className="sr-only">
                                  Leno {itemIndex + 1}
                                </FieldLabel>
                                <Input
                                  id={itemField.name}
                                  name={itemField.name}
                                  {...numberInputProps}
                                  value={itemField.state.value ?? 0}
                                  onBlur={itemField.handleBlur}
                                  onChange={(event) =>
                                    itemField.handleChange(
                                      parseNonNegativeNumber(event.target.value),
                                    )
                                  }
                                  aria-invalid={isInvalid}
                                  className="w-full text-base tabular-nums"
                                />
                                {isInvalid && <FieldError errors={itemField.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name={`labourExpenses.rates[${itemIndex}].jute`}>
                          {(itemField) => {
                            const isInvalid =
                              itemField.state.meta.isTouched && !itemField.state.meta.isValid;

                            return (
                              <Field data-invalid={isInvalid} className="gap-1">
                                <FieldLabel htmlFor={itemField.name} className="sr-only">
                                  Jute {itemIndex + 1}
                                </FieldLabel>
                                <Input
                                  id={itemField.name}
                                  name={itemField.name}
                                  {...numberInputProps}
                                  value={itemField.state.value ?? 0}
                                  onBlur={itemField.handleBlur}
                                  onChange={(event) =>
                                    itemField.handleChange(
                                      parseNonNegativeNumber(event.target.value),
                                    )
                                  }
                                  aria-invalid={isInvalid}
                                  className="w-full text-base tabular-nums"
                                />
                                {isInvalid && <FieldError errors={itemField.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9 shrink-0"
                          aria-label={`Remove rate ${itemIndex + 1}`}
                          onClick={() => listField.removeValue(itemIndex)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                    ))}
                  </>
                )}

                {listInvalid && listField.state.meta.errors.length > 0 && (
                  <FieldError errors={listField.state.meta.errors} />
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full sm:w-auto"
                onClick={() => listField.pushValue(emptyLabourExpenseRate())}
              >
                <Plus className="mr-2 size-4" aria-hidden />
                Add rate
              </Button>
            </Field>
          );
        }}
      </form.Field>
    </div>
  );
}
