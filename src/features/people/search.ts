import { z } from 'zod';

export const PERSON_DETAIL_TAB_VALUES = ['incoming', 'dispatch-ledger'] as const;

export const personDetailTabSchema = z.enum(PERSON_DETAIL_TAB_VALUES);

export const personDetailSearchSchema = z.object({
  name: z.string().optional().catch(undefined),
  mobileNumber: z.string().optional().catch(undefined),
  accountNumber: z.coerce.number().optional().catch(undefined),
  address: z.string().optional().catch(undefined),
  costPerBag: z.coerce.number().optional().catch(undefined),
  tab: personDetailTabSchema.catch('incoming'),
});

export type PersonDetailTab = z.infer<typeof personDetailTabSchema>;
export type PersonDetailSearch = z.infer<typeof personDetailSearchSchema>;

const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateParam(value?: string): Date | undefined {
  if (!value || !DATE_PARAM_PATTERN.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return undefined;
  }

  return date;
}

export function formatDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
