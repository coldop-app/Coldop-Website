import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EditLedgerDialog } from '@/features/finances/components/ledger-tab/edit-ledger-dialog';
import type { Ledger } from '@/features/finances/components/ledger-tab/types';
import { renderWithProviders, screen, user, waitFor } from '@/test/test-utils';

const mockUpdateLedger = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/finances/api/use-update-ledger', () => ({
  useUpdateLedger: () => ({
    mutateAsync: mockUpdateLedger,
  }),
}));

function makeLedger(overrides: Partial<Ledger> = {}): Ledger {
  return {
    id: 'ledger-cash-id',
    name: 'Cash A/c',
    type: 'Asset',
    subType: 'Current Assets',
    category: 'Cash',
    openingBalance: 1000,
    balance: 1000,
    closingBalance: 500,
    kind: 'Custom',
    transactionCount: 5,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderDialog(ledger = makeLedger(), onOpenChange = vi.fn()) {
  renderWithProviders(<EditLedgerDialog open onOpenChange={onOpenChange} ledger={ledger} />);

  return { ledger, onOpenChange };
}

describe('EditLedgerDialog optional field clearing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateLedger.mockResolvedValue(undefined);
  });

  it('sends null closing balance when the optional field is cleared', async () => {
    const { ledger } = renderDialog();

    const closingBalanceInput = await screen.findByLabelText(/closing balance/i);
    await user.clear(closingBalanceInput);

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateLedger).toHaveBeenCalledWith({
        id: ledger.id,
        payload: expect.objectContaining({
          name: 'Cash A/c',
          type: 'Asset',
          subType: 'Current Assets',
          category: 'Cash',
          openingBalance: 1000,
          closingBalance: null,
        }),
      });
    });
  });

  it('omits opening balance from the payload when cleared before submit', async () => {
    const { ledger } = renderDialog();

    const openingBalanceInput = await screen.findByLabelText(/opening balance/i);
    await user.clear(openingBalanceInput);

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateLedger).toHaveBeenCalledWith({
        id: ledger.id,
        payload: expect.objectContaining({
          closingBalance: 500,
        }),
      });
    });

    const payload = mockUpdateLedger.mock.calls[0]?.[0]?.payload;
    expect(payload).not.toHaveProperty('openingBalance');
  });
});
