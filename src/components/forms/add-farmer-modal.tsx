import { memo, useState, useMemo, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { Info, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useQuickAddFarmer } from '@/services/store-admin/functions/useQuickAddFarmer';
import { useStore } from '@/stores/store';
import type { FarmerStorageLink } from '@/types/farmer';

type FieldErrors = Array<{ message?: string } | undefined>;

interface AddFarmerModalProps {
  links?: FarmerStorageLink[];
  onFarmerAdded?: () => void;
}

export const AddFarmerModal = memo(function AddFarmerModal({
  links = [],
  onFarmerAdded,
}: AddFarmerModalProps) {
  const { mutate: quickAddFarmer, isPending } = useQuickAddFarmer();
  const { coldStorage, admin } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  /* ----------------------------------
     Used numbers (from links)
  ---------------------------------- */

  const usedAccountNumbers = useMemo(() => {
    return links
      .map((l) => l.accountNumber.toString())
      .filter((acc, i, s) => s.indexOf(acc) === i)
      .sort((a, b) => Number(a) - Number(b));
  }, [links]);

  const usedMobileNumbers = useMemo(() => {
    return links
      .map((l) => l.farmerId.mobileNumber)
      .filter((mob, i, s) => s.indexOf(mob) === i)
      .sort();
  }, [links]);

  const nextAccountNumber = useMemo(() => {
    if (usedAccountNumbers.length === 0) return 1;
    const latest = Number(usedAccountNumbers[usedAccountNumbers.length - 1]);
    return latest + 1;
  }, [usedAccountNumbers]);

  /* ----------------------------------
     ZOD SCHEMA
  ---------------------------------- */

  const formSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .transform((val) => {
            const trimmed = val.trim();
            if (!trimmed) return trimmed;
            return (
              trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
            );
          })
          .refine((val) => val.length > 0, { message: 'Name is required' }),

        address: z.string().trim().min(1, 'Address is required'),

        mobileNumber: z
          .string()
          .length(10, 'Mobile number must be 10 digits')
          .refine((val) => !usedMobileNumbers.includes(val), {
            message: 'Mobile number already in use',
          }),

        accountNumber: z
          .string()
          .transform((val) =>
            val === '' || Number.isNaN(Number(val)) ? '' : val
          )
          .pipe(
            z
              .string()
              .min(1, 'Please enter an account number')
              .refine((val) => {
                const num = Number(val);
                return !Number.isNaN(num) && num > 0;
              }, 'Please enter an account number')
              .refine((val) => !usedAccountNumbers.includes(val), {
                message: 'This account number is already taken',
              })
          ),

        costPerBag: z
          .string()
          .min(1, 'Cost per bag is required')
          .refine(
            (s) => !isNaN(Number(s)) && Number(s) >= 0,
            'Cost per bag cannot be negative'
          )
          .transform(Number),

        openingBalance: z
          .string()
          .refine((s) => s === '' || !isNaN(Number(s)), 'Invalid number')
          .transform((s) => (s === '' ? 0 : Number(s))),
      }),
    [usedAccountNumbers, usedMobileNumbers]
  );

  /* ----------------------------------
     FORM
  ---------------------------------- */

  const form = useForm({
    defaultValues: {
      name: '',
      address: '',
      mobileNumber: '',
      accountNumber: '',
      costPerBag: '',
      openingBalance: '',
    },

    validators: {
      onChange: formSchema,
      onBlur: formSchema,
      onSubmit: formSchema,
    },

    onSubmit: async ({ value }) => {
      if (!coldStorage?._id || !admin?._id) return;

      quickAddFarmer(
        {
          name: value.name,
          address: value.address,
          mobileNumber: value.mobileNumber,
          coldStorageId: coldStorage._id,
          linkedById: admin._id,
          accountNumber: Number(value.accountNumber),
          costPerBag: Number(value.costPerBag),
          openingBalance: Number(value.openingBalance),
        },
        {
          onSuccess: () => {
            form.reset();
            setIsOpen(false);
            onFarmerAdded?.();
          },
        }
      );
    },
  });

  /* ----------------------------------
     When modal opens: set suggested account number
  ---------------------------------- */

  useEffect(() => {
    if (isOpen) {
      form.setFieldValue('accountNumber', nextAccountNumber.toString());
    }
  }, [isOpen, nextAccountNumber, form]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) form.reset();
  };

  /* ----------------------------------
     RENDER
  ---------------------------------- */

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="font-custom h-10 w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4 shrink-0" />
          New Farmer
        </Button>
      </DialogTrigger>

      <DialogContent className="font-custom max-h-[85dvh] overflow-y-auto p-4 sm:max-w-[425px] sm:p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Add New Farmer</DialogTitle>
            <DialogDescription>
              Enter the farmer details to register them quickly
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-4 grid gap-3 sm:mt-6 sm:gap-4">
            {/* ---------------- ACCOUNT NUMBER ---------------- */}

            <form.Field
              name="accountNumber"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor={field.name}>
                        Account Number
                      </FieldLabel>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0"
                          >
                            <Info className="text-muted-foreground h-4 w-4" />
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent className="max-w-xs">
                          {usedAccountNumbers.length > 0 ? (
                            <span>
                              Used account numbers:{' '}
                              {usedAccountNumbers.join(', ')}
                            </span>
                          ) : (
                            'No account numbers in use'
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder={`Suggested: ${nextAccountNumber}`}
                          aria-invalid={isInvalid}
                          className="min-w-0 flex-1"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0 sm:self-start"
                          onClick={() =>
                            form.setFieldValue(
                              'accountNumber',
                              nextAccountNumber.toString()
                            )
                          }
                        >
                          Use suggested ({nextAccountNumber})
                        </Button>
                      </div>

                      <p className="text-muted-foreground text-xs">
                        Enter any positive number. Duplicate values are not
                        allowed.
                      </p>
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

            {/* ---------------- MOBILE NUMBER ---------------- */}

            <form.Field
              name="mobileNumber"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Mobile Number</FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      type="tel"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value.replace(/\D/g, '').slice(0, 10)
                        )
                      }
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      aria-invalid={isInvalid}
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

            {/* ---------------- NAME ---------------- */}

            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter farmer name"
                      aria-invalid={isInvalid}
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

            {/* ---------------- ADDRESS ---------------- */}

            <form.Field
              name="address"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Address</FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter address"
                      aria-invalid={isInvalid}
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

            {/* ---------------- COST PER BAG ---------------- */}

            <form.Field
              name="costPerBag"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Cost per bag</FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={0}
                      step={0.01}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="0"
                      aria-invalid={isInvalid}
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

            {/* ---------------- OPENING BALANCE ---------------- */}

            <form.Field
              name="openingBalance"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Opening balance
                    </FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      step={0.01}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="0"
                      aria-invalid={isInvalid}
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
          </FieldGroup>

          <DialogFooter className="mt-4 flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="font-custom w-full sm:w-auto"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={isPending}
              className="font-custom w-full sm:w-auto"
            >
              {isPending ? 'Adding...' : 'Add Farmer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
