import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EditVoucherDialog } from '@/features/finances/components/voucher-tab/edit-voucher-dialog';
import type { Voucher } from '@/features/finances/components/voucher-tab/types';
import { makeLedgerOptions } from '@/test/fixtures';
import { renderWithProviders, screen, user, waitFor } from '@/test/test-utils';

const mockUpdateVoucher = vi.fn();
const ledgerOptions = makeLedgerOptions();

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/finances/api/use-update-voucher', () => ({
  useUpdateVoucher: () => ({
    mutateAsync: mockUpdateVoucher,
  }),
}));

function makeVoucher(overrides: Partial<Voucher> = {}): Voucher {
  return {
    id: 'voucher-1',
    voucherNo: '101',
    date: '2026-06-21T10:30:00.000Z',
    debit: 'Cash A/c',
    credit: 'Bank A/c',
    debitLedgerId: 'ledger-cash-id',
    creditLedgerId: 'ledger-bank-id',
    amount: 250,
    narration: 'Existing narration',
    ...overrides,
  };
}

function renderDialog(voucher = makeVoucher(), onOpenChange = vi.fn()) {
  renderWithProviders(
    <EditVoucherDialog
      open
      onOpenChange={onOpenChange}
      voucher={voucher}
      ledgerOptions={ledgerOptions}
    />,
  );

  return { voucher, onOpenChange };
}

describe('EditVoucherDialog optional field clearing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateVoucher.mockResolvedValue(undefined);
  });

  it('sends empty narration in the update payload when narration is cleared', async () => {
    const { voucher } = renderDialog();

    const narrationField = await screen.findByDisplayValue('Existing narration');
    await user.clear(narrationField);

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateVoucher).toHaveBeenCalledWith({
        id: voucher.id,
        payload: expect.objectContaining({
          debitLedger: 'ledger-cash-id',
          creditLedger: 'ledger-bank-id',
          amount: 250,
          narration: '',
        }),
      });
    });
  });
});
