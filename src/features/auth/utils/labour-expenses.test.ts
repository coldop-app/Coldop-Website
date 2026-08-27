import { describe, expect, it } from 'vitest';

import { makePreferences } from '@/test/fixtures';

import {
  getLabourExpenseDialogLines,
  getLabourExpensesCustomField,
  isLabourExpensesEnabled,
  labourExpenseActivityLabel,
} from './labour-expenses';

describe('isLabourExpensesEnabled', () => {
  it('returns false when preferences are missing', () => {
    expect(isLabourExpensesEnabled(null)).toBe(false);
    expect(isLabourExpensesEnabled(undefined)).toBe(false);
  });

  it('returns false when labourExpenses is absent or malformed', () => {
    expect(isLabourExpensesEnabled(makePreferences())).toBe(false);
    expect(
      isLabourExpensesEnabled(makePreferences({ customFields: { labourExpenses: true } })),
    ).toBe(false);
    expect(
      isLabourExpensesEnabled(
        makePreferences({ customFields: { labourExpenses: { enabled: 'true' } } }),
      ),
    ).toBe(false);
  });

  it('returns false when labourExpenses.enabled is false', () => {
    expect(
      isLabourExpensesEnabled(
        makePreferences({ customFields: { labourExpenses: { enabled: false } } }),
      ),
    ).toBe(false);
  });

  it('returns true only when labourExpenses.enabled is true', () => {
    expect(
      isLabourExpensesEnabled(
        makePreferences({ customFields: { labourExpenses: { enabled: true } } }),
      ),
    ).toBe(true);
  });
});

describe('getLabourExpensesCustomField', () => {
  it('returns the typed field when labourExpenses is a record', () => {
    expect(
      getLabourExpensesCustomField(
        makePreferences({ customFields: { labourExpenses: { enabled: false } } }),
      ),
    ).toEqual({ enabled: false, rates: {} });
  });

  it('parses valid rates and skips malformed entries', () => {
    expect(
      getLabourExpensesCustomField(
        makePreferences({
          customFields: {
            labourExpenses: {
              enabled: true,
              rates: {
                bagsStored: { leno: 35, jute: 23 },
                bagsNikas: { leno: '35', jute: 23 },
                bagsRestore: 12,
              },
            },
          },
        }),
      ),
    ).toEqual({
      enabled: true,
      rates: { bagsStored: { leno: 35, jute: 23 } },
    });
  });

  it('parses debitLedgerId from a string or Mongo $oid object', () => {
    expect(
      getLabourExpensesCustomField(
        makePreferences({
          customFields: {
            labourExpenses: {
              enabled: true,
              rates: {
                bagsStored: {
                  leno: 35,
                  jute: 23,
                  debitLedgerId: '6a9018fa3f25e88c8658314c',
                },
                bagsNikas: {
                  leno: 35,
                  jute: 23,
                  debitLedgerId: { $oid: '6a90190e3f25e88c8658314d' },
                },
                bagsRestore: {
                  leno: 35,
                  jute: 23,
                  debitLedgerId: { $oid: '' },
                },
              },
            },
          },
        }),
      ),
    ).toEqual({
      enabled: true,
      rates: {
        bagsStored: { leno: 35, jute: 23, debitLedgerId: '6a9018fa3f25e88c8658314c' },
        bagsNikas: { leno: 35, jute: 23, debitLedgerId: '6a90190e3f25e88c8658314d' },
        bagsRestore: { leno: 35, jute: 23 },
      },
    });
  });

  it('parses other labour expenses from rates without using leno or jute', () => {
    expect(
      getLabourExpensesCustomField(
        makePreferences({
          customFields: {
            labourExpenses: {
              enabled: true,
              rates: {
                bagsStored: { leno: 35, jute: 23 },
                otherLabourExpenses: {
                  name: 'Other Labour Expenses',
                  debitLedgerId: { $oid: '6a901a343f25e88c8658315d' },
                },
              },
            },
          },
        }),
      ),
    ).toEqual({
      enabled: true,
      rates: { bagsStored: { leno: 35, jute: 23 } },
      otherLabourExpense: {
        id: 'otherLabourExpenses',
        label: 'Other Labour Expenses',
        debitLedgerId: '6a901a343f25e88c8658315d',
      },
    });
  });
});

describe('labourExpenseActivityLabel', () => {
  it('humanizes camelCase activity keys', () => {
    expect(labourExpenseActivityLabel('bagsStored')).toBe('Bags Stored');
    expect(labourExpenseActivityLabel('shiftingChToCh')).toBe('Shifting Ch To Ch');
  });
});

describe('getLabourExpenseDialogLines', () => {
  it('returns numbered lines in Object.entries order', () => {
    expect(
      getLabourExpenseDialogLines(
        makePreferences({
          customFields: {
            labourExpenses: {
              enabled: true,
              rates: {
                bagsStored: {
                  leno: 35,
                  jute: 23,
                  debitLedgerId: 'ledger-1',
                },
                bagsNikas: { leno: 10, jute: 8 },
              },
            },
          },
        }),
      ),
    ).toEqual([
      {
        id: 'bagsStored',
        number: '1.',
        label: 'Bags Stored',
        lenoRate: 35,
        juteRate: 23,
        debitLedgerId: 'ledger-1',
      },
      {
        id: 'bagsNikas',
        number: '2.',
        label: 'Bags Nikas',
        lenoRate: 10,
        juteRate: 8,
      },
    ]);
  });

  it('appends other labour expenses as a manual-rate line', () => {
    expect(
      getLabourExpenseDialogLines(
        makePreferences({
          customFields: {
            labourExpenses: {
              enabled: true,
              rates: {
                bagsStored: { leno: 35, jute: 23 },
                otherLabourExpenses: {
                  debitLedgerId: 'ledger-other',
                },
              },
            },
          },
        }),
      ),
    ).toEqual([
      {
        id: 'bagsStored',
        number: '1.',
        label: 'Bags Stored',
        lenoRate: 35,
        juteRate: 23,
      },
      {
        id: 'otherLabourExpenses',
        number: '2.',
        label: 'Other Labour Expenses',
        lenoRate: 0,
        juteRate: 0,
        manualRate: true,
        debitLedgerId: 'ledger-other',
      },
    ]);
  });
});
