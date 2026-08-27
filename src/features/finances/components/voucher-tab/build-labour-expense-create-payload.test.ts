import { describe, expect, it } from 'vitest';

import { buildLabourExpenseCreatePayload } from './build-labour-expense-create-payload';

describe('buildLabourExpenseCreatePayload', () => {
  it('sends only rows with Total greater than 0 and no credit ledger', () => {
    const result = buildLabourExpenseCreatePayload({
      date: '2026-08-27T00:00:00.000Z',
      rows: [
        { label: 'Bags Stored', debitLedgerId: 'ledger-stored', total: 350 },
        { label: 'Bags Nikas', debitLedgerId: 'ledger-nikas', total: 0 },
        { label: 'Bags Restore', debitLedgerId: 'ledger-restore', total: 230.126 },
      ],
    });

    expect(result).toEqual({
      ok: true,
      payload: {
        date: '2026-08-27T00:00:00.000Z',
        debits: [
          { debitLedgerId: 'ledger-stored', amount: 350 },
          { debitLedgerId: 'ledger-restore', amount: 230.13 },
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
        { label: 'Bags Stored', debitLedgerId: 'ledger-stored', total: 350, narration: '  ' },
        {
          label: 'Other Labour Expenses',
          debitLedgerId: 'ledger-other',
          total: 500,
          narration: '  Extra unloading at shed 2  ',
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      payload: {
        date: '2026-08-27T00:00:00.000Z',
        debits: [
          { debitLedgerId: 'ledger-stored', amount: 350 },
          {
            debitLedgerId: 'ledger-other',
            amount: 500,
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
        rows: [{ label: 'Bags Stored', total: 350 }],
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
        rows: [{ label: 'Bags Stored', debitLedgerId: 'ledger-stored', total: 0 }],
      }),
    ).toEqual({
      ok: false,
      error: 'Enter at least one labour expense with a total greater than 0',
    });
  });
});
