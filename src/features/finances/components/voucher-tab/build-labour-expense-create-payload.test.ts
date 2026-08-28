import { describe, expect, it } from 'vitest';

import { buildLabourExpenseCreatePayload } from './build-labour-expense-create-payload';

describe('buildLabourExpenseCreatePayload', () => {
  it('sends bag counts and rates with only Total > 0 rows and no credit ledger', () => {
    const result = buildLabourExpenseCreatePayload({
      date: '2026-08-27T00:00:00.000Z',
      rows: [
        {
          label: 'Bags Stored',
          debitLedgerId: 'ledger-stored',
          total: 350,
          lenoBags: 10,
          juteBags: 0,
          lenoRate: 35,
          juteRate: 23,
        },
        {
          label: 'Bags Nikas',
          debitLedgerId: 'ledger-nikas',
          total: 0,
          lenoBags: 0,
          juteBags: 0,
          lenoRate: 35,
          juteRate: 23,
        },
        {
          label: 'Bags Restore',
          debitLedgerId: 'ledger-restore',
          total: 230.126,
          lenoBags: 0,
          juteBags: 10,
          lenoRate: 35,
          juteRate: 23.0126,
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      payload: {
        date: '2026-08-27T00:00:00.000Z',
        debits: [
          {
            debitLedgerId: 'ledger-stored',
            amount: 350,
            lenoBags: 10,
            juteBags: 0,
            lenoRate: 35,
            juteRate: 23,
          },
          {
            debitLedgerId: 'ledger-restore',
            amount: 230.13,
            lenoBags: 0,
            juteBags: 10,
            lenoRate: 35,
            juteRate: 23.01,
          },
        ],
      },
    });
    if (result.ok) {
      expect(result.payload).not.toHaveProperty('creditLedger');
      expect(result.payload).not.toHaveProperty('creditLedgerId');
    }
  });

  it('includes trimmed narration only when it is non-empty', () => {
    const result = buildLabourExpenseCreatePayload({
      date: '2026-08-27T00:00:00.000Z',
      rows: [
        {
          label: 'Bags Stored',
          debitLedgerId: 'ledger-stored',
          total: 350,
          lenoBags: 10,
          juteBags: 0,
          lenoRate: 35,
          juteRate: 23,
          narration: '  ',
        },
        {
          label: 'Other Labour Expenses',
          debitLedgerId: 'ledger-other',
          total: 500,
          lenoBags: 8,
          juteBags: 4,
          lenoRate: 40,
          juteRate: 45,
          narration: '  Extra unloading at shed 2  ',
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      payload: {
        date: '2026-08-27T00:00:00.000Z',
        debits: [
          {
            debitLedgerId: 'ledger-stored',
            amount: 350,
            lenoBags: 10,
            juteBags: 0,
            lenoRate: 35,
            juteRate: 23,
          },
          {
            debitLedgerId: 'ledger-other',
            amount: 500,
            lenoBags: 8,
            juteBags: 4,
            lenoRate: 40,
            juteRate: 45,
            narration: 'Extra unloading at shed 2',
          },
        ],
      },
    });
    if (result.ok) {
      expect(result.payload.debits[0]).not.toHaveProperty('narration');
    }
  });

  it('fails when a positive-total row is missing debitLedgerId', () => {
    expect(
      buildLabourExpenseCreatePayload({
        date: '2026-08-27T00:00:00.000Z',
        rows: [
          {
            label: 'Bags Stored',
            total: 350,
            lenoBags: 10,
            juteBags: 0,
            lenoRate: 35,
            juteRate: 23,
          },
        ],
      }),
    ).toEqual({
      ok: false,
      error: 'Missing debit ledger for Bags Stored',
    });
  });

  it('fails when no row has a qualifying total', () => {
    expect(
      buildLabourExpenseCreatePayload({
        date: '2026-08-27T00:00:00.000Z',
        rows: [
          {
            label: 'Bags Stored',
            debitLedgerId: 'ledger-stored',
            total: 0,
            lenoBags: 0,
            juteBags: 0,
            lenoRate: 35,
            juteRate: 23,
          },
        ],
      }),
    ).toEqual({
      ok: false,
      error: 'Enter at least one labour expense with a total greater than 0',
    });
  });
});
