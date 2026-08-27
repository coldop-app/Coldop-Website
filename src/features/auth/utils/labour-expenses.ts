import type {
  LabourExpenseBagRates,
  LabourExpensesCustomField,
  OtherLabourExpensePreference,
  Preferences,
} from '../types';

export const LABOUR_EXPENSES_CUSTOM_FIELD_KEY = 'labourExpenses';

export const OTHER_LABOUR_EXPENSE_RATE_KEYS = ['otherLabourExpenses', 'otherExpenses'] as const;

export type LabourExpenseDialogLine = {
  id: string;
  number: string;
  label: string;
  lenoRate: number;
  juteRate: number;
  debitLedgerId?: string;
  manualRate?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isOtherLabourExpenseKey(key: string): boolean {
  return (OTHER_LABOUR_EXPENSE_RATE_KEYS as readonly string[]).includes(key);
}

function parseDebitLedgerId(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (isRecord(value) && typeof value.$oid === 'string') {
    const trimmed = value.$oid.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  return undefined;
}

function parseBagRates(value: unknown): LabourExpenseBagRates | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.leno !== 'number' || typeof value.jute !== 'number') {
    return null;
  }

  if (!Number.isFinite(value.leno) || !Number.isFinite(value.jute)) {
    return null;
  }

  const debitLedgerId = parseDebitLedgerId(value.debitLedgerId);

  return {
    leno: value.leno,
    jute: value.jute,
    ...(debitLedgerId ? { debitLedgerId } : {}),
  };
}

function parseRates(value: unknown): Record<string, LabourExpenseBagRates> {
  if (!isRecord(value)) {
    return {};
  }

  const rates: Record<string, LabourExpenseBagRates> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (isOtherLabourExpenseKey(key)) {
      continue;
    }

    const parsed = parseBagRates(entry);
    if (parsed) {
      rates[key] = parsed;
    }
  }

  return rates;
}

function otherLabourExpenseFromRecord(
  key: string,
  value: unknown,
): OtherLabourExpensePreference | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const label =
    typeof value.name === 'string' && value.name.trim()
      ? value.name.trim()
      : labourExpenseActivityLabel(key);
  const debitLedgerId = parseDebitLedgerId(value.debitLedgerId);

  return {
    id: key,
    label,
    ...(debitLedgerId ? { debitLedgerId } : {}),
  };
}

function parseOtherLabourExpense(
  labourExpenses: Record<string, unknown>,
): OtherLabourExpensePreference | undefined {
  const rates = labourExpenses.rates;

  if (isRecord(rates)) {
    for (const key of OTHER_LABOUR_EXPENSE_RATE_KEYS) {
      if (key in rates) {
        const parsed = otherLabourExpenseFromRecord(key, rates[key]);
        if (parsed) {
          return parsed;
        }
      }
    }
  }

  return otherLabourExpenseFromRecord(
    'otherLabourExpenses',
    labourExpenses.otherLabourExpenses,
  );
}

export function getLabourExpensesCustomField(
  preferences: Preferences | null | undefined,
): LabourExpensesCustomField | null {
  const labourExpenses = preferences?.customFields?.[LABOUR_EXPENSES_CUSTOM_FIELD_KEY];
  if (!isRecord(labourExpenses)) {
    return null;
  }

  const otherLabourExpense = parseOtherLabourExpense(labourExpenses);

  return {
    enabled: labourExpenses.enabled === true,
    rates: parseRates(labourExpenses.rates),
    ...(otherLabourExpense ? { otherLabourExpense } : {}),
  };
}

export function isLabourExpensesEnabled(preferences: Preferences | null | undefined): boolean {
  return getLabourExpensesCustomField(preferences)?.enabled === true;
}

export function labourExpenseActivityLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getLabourExpenseDialogLines(
  preferences: Preferences | null | undefined,
): LabourExpenseDialogLine[] {
  const parsed = getLabourExpensesCustomField(preferences);
  if (!parsed) {
    return [];
  }

  const lines: LabourExpenseDialogLine[] = Object.entries(parsed.rates).map(
    ([id, rates], index) => ({
      id,
      number: `${index + 1}.`,
      label: labourExpenseActivityLabel(id),
      lenoRate: rates.leno,
      juteRate: rates.jute,
      ...(rates.debitLedgerId ? { debitLedgerId: rates.debitLedgerId } : {}),
    }),
  );

  if (parsed.otherLabourExpense) {
    lines.push({
      id: parsed.otherLabourExpense.id,
      number: `${lines.length + 1}.`,
      label: parsed.otherLabourExpense.label,
      lenoRate: 0,
      juteRate: 0,
      manualRate: true,
      ...(parsed.otherLabourExpense.debitLedgerId
        ? { debitLedgerId: parsed.otherLabourExpense.debitLedgerId }
        : {}),
    });
  }

  return lines;
}
