import { Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { AddFarmerFormApi } from '@/features/people/forms/use-add-farmer-form';
import type { EditFarmerFormApi } from '@/features/people/forms/use-edit-farmer-form';
import {
  blurTargetOnNumberWheel,
  businessNumberSpinnerClassName,
  preventArrowUpDownOnNumericInput,
} from '@/lib/business-number-input';
import { cn } from '@/lib/utils';

export function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

const numericInputProps = {
  type: 'number' as const,
  step: '0.01',
  min: 0,
  inputMode: 'decimal' as const,
  onWheel: blurTargetOnNumberWheel,
};

function RequiredFieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <FieldLabel htmlFor={htmlFor} className="gap-1">
      {children}
      <span className="text-destructive" aria-hidden="true">
        *
      </span>
    </FieldLabel>
  );
}

function OptionalFieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <FieldLabel htmlFor={htmlFor} className="flex flex-wrap items-center gap-2">
      {children}
      <Badge variant="secondary" className="text-xs font-normal">
        Optional
      </Badge>
    </FieldLabel>
  );
}

type FarmerFormApi = AddFarmerFormApi | EditFarmerFormApi;

type FarmerFormFieldsProps = {
  form: FarmerFormApi;
  mode: 'add' | 'edit';
  showFinances: boolean;
  usedAccountNumbers?: number[];
  nextAccountNumber?: number;
};

export function FarmerFormFields({
  form,
  mode,
  showFinances,
  usedAccountNumbers,
  nextAccountNumber,
}: FarmerFormFieldsProps) {
  return (
    <FieldGroup className="gap-4">
      <form.Field name="accountNumber">
        {(field) => {
          const isInvalid = isFieldInvalid(field.state.meta);

          return (
            <Field data-invalid={isInvalid}>
              {mode === 'add' ? (
                <div className="flex items-center justify-between gap-2">
                  <OptionalFieldLabel htmlFor={field.name}>Account number</OptionalFieldLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        aria-label="View used account numbers"
                      >
                        <Info className="text-muted-foreground size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-sm">
                      {(usedAccountNumbers?.length ?? 0) > 0 ? (
                        <span>
                          Used account numbers:{' '}
                          <span className="tabular-nums">{usedAccountNumbers?.join(', ')}</span>
                        </span>
                      ) : (
                        'No account numbers in use yet.'
                      )}
                    </TooltipContent>
                  </Tooltip>
                </div>
              ) : (
                <RequiredFieldLabel htmlFor={field.name}>Account number</RequiredFieldLabel>
              )}

              <div className="flex flex-col gap-2">
                <div className={cn('flex flex-col gap-2', mode === 'add' && 'sm:flex-row')}>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    placeholder={mode === 'add' ? `Suggested: ${nextAccountNumber}` : undefined}
                    inputMode="numeric"
                    min={1}
                    className={cn('flex-1 tabular-nums', businessNumberSpinnerClassName)}
                    onWheel={blurTargetOnNumberWheel}
                    onKeyDown={preventArrowUpDownOnNumericInput}
                  />
                  {mode === 'add' ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => {
                        if (nextAccountNumber == null) return;
                        form.setFieldValue('accountNumber', nextAccountNumber.toString());
                      }}
                    >
                      Use suggested (<span className="tabular-nums">{nextAccountNumber}</span>)
                    </Button>
                  ) : null}
                </div>
                <FieldDescription>
                  {mode === 'add'
                    ? 'Leave blank to auto-assign the next number, or enter a positive value. Duplicates are not allowed.'
                    : 'Enter a positive whole number. Duplicates are not allowed.'}
                </FieldDescription>
              </div>

              {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="mobileNumber">
        {(field) => {
          const isInvalid = isFieldInvalid(field.state.meta);

          return (
            <Field data-invalid={isInvalid}>
              <RequiredFieldLabel htmlFor={field.name}>Mobile number</RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(event.target.value.replace(/\D/g, '').slice(0, 10))
                }
                aria-invalid={isInvalid}
                placeholder="Enter 10-digit mobile number"
                type="tel"
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel"
                className="tabular-nums"
              />
              {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="name">
        {(field) => {
          const isInvalid = isFieldInvalid(field.state.meta);

          return (
            <Field data-invalid={isInvalid}>
              <RequiredFieldLabel htmlFor={field.name}>Name</RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                placeholder="Enter farmer name"
                autoComplete="name"
              />
              {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="address">
        {(field) => {
          const isInvalid = isFieldInvalid(field.state.meta);

          return (
            <Field data-invalid={isInvalid}>
              <RequiredFieldLabel htmlFor={field.name}>Address</RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                placeholder="Enter address"
                autoComplete="street-address"
              />
              {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
            </Field>
          );
        }}
      </form.Field>

      {showFinances ? (
        <>
          <form.Field name="costPerBag">
            {(field) => {
              const isInvalid = isFieldInvalid(field.state.meta);

              return (
                <Field data-invalid={isInvalid}>
                  <RequiredFieldLabel htmlFor={field.name}>Cost per bag</RequiredFieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="110"
                    className={cn('tabular-nums', businessNumberSpinnerClassName)}
                    {...numericInputProps}
                    onKeyDown={preventArrowUpDownOnNumericInput}
                  />
                  <FieldDescription>Storage rate in INR per bag.</FieldDescription>
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="openingBalance">
            {(field) => {
              const isInvalid = isFieldInvalid(field.state.meta);

              return (
                <Field data-invalid={isInvalid}>
                  <OptionalFieldLabel htmlFor={field.name}>Opening balance</OptionalFieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="0.00"
                    className={cn('tabular-nums', businessNumberSpinnerClassName)}
                    {...numericInputProps}
                    onKeyDown={preventArrowUpDownOnNumericInput}
                  />
                  <FieldDescription>
                    {mode === 'add'
                      ? 'Optional ledger opening balance in INR. Leave blank for zero.'
                      : 'Optional ledger balance update in INR. Leave blank to keep the current balance.'}
                  </FieldDescription>
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              );
            }}
          </form.Field>
        </>
      ) : null}
    </FieldGroup>
  );
}
