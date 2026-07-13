import * as z from 'zod';

import type {
  FarmerStorageLink,
  QuickRegisterFarmerPayload,
  UpdateFarmerStorageLinkPayload,
} from '@/features/people/types';

export type AddFarmerFormInput = {
  accountNumber: string;
  mobileNumber: string;
  name: string;
  address: string;
  costPerBag: string;
  openingBalance: string;
};

type AddFarmerFormSchemaOptions = {
  getUsedAccountNumbers: () => number[];
  getUsedMobileNumbers: () => string[];
  showFinances?: boolean;
};

function parseOptionalNonNegativeNumber(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseAccountNumber(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
}

export function createAddFarmerFormSchema({
  getUsedAccountNumbers,
  getUsedMobileNumbers,
  showFinances = true,
}: AddFarmerFormSchemaOptions) {
  return z
    .object({
      accountNumber: z.string(),
      mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
      name: z
        .string()
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters'),
      address: z
        .string()
        .trim()
        .min(1, 'Address is required')
        .max(500, 'Address must be at most 500 characters'),
      costPerBag: z.string(),
      openingBalance: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.accountNumber.trim() !== '') {
        const accountNumber = parseAccountNumber(values.accountNumber);
        if (accountNumber === undefined) {
          ctx.addIssue({
            code: 'custom',
            message: 'Enter a positive whole number',
            path: ['accountNumber'],
          });
        } else if (getUsedAccountNumbers().includes(accountNumber)) {
          ctx.addIssue({
            code: 'custom',
            message: 'This account number is already in use',
            path: ['accountNumber'],
          });
        }
      }

      const usedMobileNumbers = getUsedMobileNumbers();
      if (usedMobileNumbers.includes(values.mobileNumber)) {
        ctx.addIssue({
          code: 'custom',
          message: 'This mobile number is already linked to a farmer',
          path: ['mobileNumber'],
        });
      }

      if (showFinances) {
        if (values.costPerBag.trim() === '') {
          ctx.addIssue({
            code: 'custom',
            message: 'Cost per bag is required',
            path: ['costPerBag'],
          });
        } else {
          const parsed = parseOptionalNonNegativeNumber(values.costPerBag);
          if (parsed === undefined || parsed < 0) {
            ctx.addIssue({
              code: 'custom',
              message: 'Enter a valid amount of 0 or greater',
              path: ['costPerBag'],
            });
          }
        }

        if (values.openingBalance.trim() !== '') {
          const parsed = parseOptionalNonNegativeNumber(values.openingBalance);
          if (parsed === undefined) {
            ctx.addIssue({
              code: 'custom',
              message: 'Enter a valid amount',
              path: ['openingBalance'],
            });
          }
        }
      }
    });
}

export function createDefaultAddFarmerValues(): AddFarmerFormInput {
  return {
    accountNumber: '',
    mobileNumber: '',
    name: '',
    address: '',
    costPerBag: '',
    openingBalance: '',
  };
}

type BuildAddFarmerPayloadOptions = {
  showFinances?: boolean;
};

export function buildAddFarmerPayload(
  values: AddFarmerFormInput,
  { showFinances = true }: BuildAddFarmerPayloadOptions = {},
): QuickRegisterFarmerPayload {
  const accountNumber = parseAccountNumber(values.accountNumber);
  const costPerBag = showFinances ? parseOptionalNonNegativeNumber(values.costPerBag) : undefined;
  const openingBalance = showFinances
    ? parseOptionalNonNegativeNumber(values.openingBalance)
    : undefined;

  return {
    name: values.name.trim(),
    address: values.address.trim(),
    mobileNumber: values.mobileNumber,
    ...(accountNumber !== undefined ? { accountNumber } : {}),
    ...(costPerBag !== undefined ? { costPerBag } : {}),
    ...(openingBalance !== undefined ? { openingBalance } : {}),
  };
}

type EditFarmerFormSchemaOptions = {
  getUsedAccountNumbers: () => number[];
  getUsedMobileNumbers: () => string[];
  showFinances?: boolean;
};

export function createEditFarmerFormSchema({
  getUsedAccountNumbers,
  getUsedMobileNumbers,
  showFinances = true,
}: EditFarmerFormSchemaOptions) {
  return z
    .object({
      accountNumber: z.string(),
      mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
      name: z
        .string()
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters'),
      address: z
        .string()
        .trim()
        .min(1, 'Address is required')
        .max(500, 'Address must be at most 500 characters'),
      costPerBag: z.string(),
      openingBalance: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.accountNumber.trim() === '') {
        ctx.addIssue({
          code: 'custom',
          message: 'Account number is required',
          path: ['accountNumber'],
        });
      } else {
        const accountNumber = parseAccountNumber(values.accountNumber);
        if (accountNumber === undefined) {
          ctx.addIssue({
            code: 'custom',
            message: 'Enter a positive whole number',
            path: ['accountNumber'],
          });
        } else if (getUsedAccountNumbers().includes(accountNumber)) {
          ctx.addIssue({
            code: 'custom',
            message: 'This account number is already in use',
            path: ['accountNumber'],
          });
        }
      }

      const usedMobileNumbers = getUsedMobileNumbers();
      if (usedMobileNumbers.includes(values.mobileNumber)) {
        ctx.addIssue({
          code: 'custom',
          message: 'This mobile number is already linked to a farmer',
          path: ['mobileNumber'],
        });
      }

      if (showFinances) {
        if (values.costPerBag.trim() === '') {
          ctx.addIssue({
            code: 'custom',
            message: 'Cost per bag is required',
            path: ['costPerBag'],
          });
        } else {
          const parsed = parseOptionalNonNegativeNumber(values.costPerBag);
          if (parsed === undefined || parsed < 0) {
            ctx.addIssue({
              code: 'custom',
              message: 'Enter a valid amount of 0 or greater',
              path: ['costPerBag'],
            });
          }
        }

        if (values.openingBalance.trim() !== '') {
          const parsed = parseOptionalNonNegativeNumber(values.openingBalance);
          if (parsed === undefined) {
            ctx.addIssue({
              code: 'custom',
              message: 'Enter a valid amount',
              path: ['openingBalance'],
            });
          }
        }
      }
    });
}

export function linkToFormValues(link: FarmerStorageLink): AddFarmerFormInput {
  return {
    accountNumber: String(link.accountNumber),
    mobileNumber: link.mobileNumber,
    name: link.name,
    address: link.address,
    costPerBag: String(link.costPerBag),
    openingBalance: '',
  };
}

type BuildUpdateFarmerPayloadOptions = {
  showFinances?: boolean;
};

export function buildUpdateFarmerPayload(
  values: AddFarmerFormInput,
  { showFinances = true }: BuildUpdateFarmerPayloadOptions = {},
): UpdateFarmerStorageLinkPayload {
  const accountNumber = parseAccountNumber(values.accountNumber);
  const costPerBag = showFinances ? parseOptionalNonNegativeNumber(values.costPerBag) : undefined;
  const openingBalance = showFinances
    ? parseOptionalNonNegativeNumber(values.openingBalance)
    : undefined;

  return {
    name: values.name.trim(),
    address: values.address.trim(),
    mobileNumber: values.mobileNumber,
    ...(accountNumber !== undefined ? { accountNumber } : {}),
    ...(costPerBag !== undefined ? { costPerBag } : {}),
    ...(openingBalance !== undefined ? { openingBalance } : {}),
  };
}
