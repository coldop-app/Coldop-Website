import { describe, expect, it } from 'vitest';

import { makePreferences } from '@/test/fixtures';

import {
  formValuesToUpdatePayload,
  preferencesFormSchema,
  preferencesToFormValues,
} from './preferences-form-schema';

describe('preferences labour expenses custom field', () => {
  it('keeps labourExpenses null and does not invent it on save when absent', () => {
    const formValues = preferencesToFormValues(
      makePreferences({ customFields: { defaultChamber: 'A1' } }),
    );

    expect(formValues.labourExpenses).toBeNull();
    expect(formValues.customFields).toEqual([{ key: 'defaultChamber', value: 'A1' }]);

    expect(formValuesToUpdatePayload(formValues).customFields).toEqual({
      defaultChamber: 'A1',
    });
  });

  it('maps an existing labourExpenses object to rate rows and saves it back as an object', () => {
    const formValues = preferencesToFormValues(
      makePreferences({
        customFields: {
          labourExpenses: {
            enabled: true,
            rates: {
              bagsStored: { leno: 35, jute: 23 },
              bagsNikas: { leno: 35, jute: 23 },
            },
          },
        },
      }),
    );

    expect(formValues.labourExpenses).toEqual({
      enabled: true,
      rates: [
        { key: 'bagsStored', leno: 35, jute: 23 },
        { key: 'bagsNikas', leno: 35, jute: 23 },
      ],
    });
    expect(formValues.customFields).toEqual([]);

    expect(formValuesToUpdatePayload(formValues).customFields).toEqual({
      labourExpenses: {
        enabled: true,
        rates: {
          bagsStored: { leno: 35, jute: 23 },
          bagsNikas: { leno: 35, jute: 23 },
        },
      },
    });
  });

  it('keeps generic custom fields as strings on round-trip', () => {
    const formValues = preferencesToFormValues(
      makePreferences({
        customFields: {
          defaultChamber: 'A1',
          extraConfig: { nested: true },
        },
      }),
    );

    expect(formValues.customFields).toEqual([
      { key: 'defaultChamber', value: 'A1' },
      { key: 'extraConfig', value: JSON.stringify({ nested: true }) },
    ]);

    expect(formValuesToUpdatePayload(formValues).customFields).toEqual({
      defaultChamber: 'A1',
      extraConfig: JSON.stringify({ nested: true }),
    });
  });

  it('preserves debitLedgerId on labour expense rates through save', () => {
    const formValues = preferencesToFormValues(
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
              bagsNikas: { leno: 10, jute: 8 },
            },
          },
        },
      }),
    );

    expect(formValues.labourExpenses?.rates).toEqual([
      {
        key: 'bagsStored',
        leno: 35,
        jute: 23,
        debitLedgerId: '6a9018fa3f25e88c8658314c',
      },
      { key: 'bagsNikas', leno: 10, jute: 8 },
    ]);

    expect(formValuesToUpdatePayload(formValues).customFields).toEqual({
      labourExpenses: {
        enabled: true,
        rates: {
          bagsStored: {
            leno: 35,
            jute: 23,
            debitLedgerId: '6a9018fa3f25e88c8658314c',
          },
          bagsNikas: { leno: 10, jute: 8 },
        },
      },
    });
  });

  it('preserves other labour expenses without treating them as priced rate rows', () => {
    const formValues = preferencesToFormValues(
      makePreferences({
        customFields: {
          labourExpenses: {
            enabled: true,
            rates: {
              bagsStored: { leno: 35, jute: 23 },
              otherLabourExpenses: {
                name: 'Other Labour Expenses',
                debitLedgerId: 'ledger-other',
              },
            },
          },
        },
      }),
    );

    expect(formValues.labourExpenses?.rates).toEqual([
      { key: 'bagsStored', leno: 35, jute: 23 },
    ]);
    expect(formValues.labourExpenses?.otherLabourExpense).toEqual({
      id: 'otherLabourExpenses',
      label: 'Other Labour Expenses',
      debitLedgerId: 'ledger-other',
    });

    expect(formValuesToUpdatePayload(formValues).customFields).toEqual({
      labourExpenses: {
        enabled: true,
        rates: {
          bagsStored: { leno: 35, jute: 23 },
          otherLabourExpenses: {
            name: 'Other Labour Expenses',
            debitLedgerId: 'ledger-other',
          },
        },
      },
    });
  });

  it('rejects duplicate labour expense activity names', () => {
    const formValues = preferencesToFormValues(makePreferences());
    const result = preferencesFormSchema.safeParse({
      ...formValues,
      labourExpenses: {
        enabled: true,
        rates: [
          { key: 'bagsStored', leno: 1, jute: 2 },
          { key: 'bagsStored', leno: 3, jute: 4 },
        ],
      },
    });

    expect(result.success).toBe(false);
  });
});
