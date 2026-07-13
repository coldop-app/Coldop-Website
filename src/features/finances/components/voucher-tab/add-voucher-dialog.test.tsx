import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import { AddVoucherDialog } from '@/features/finances/components/voucher-tab/add-voucher-dialog';
import { makeLedgerOptions } from '@/test/fixtures';
import {
  renderWithProviders,
  screen,
  selectComboboxOption,
  user,
  waitFor,
} from '@/test/test-utils';

const mockCreateVoucher = vi.fn();
const ledgerOptions = makeLedgerOptions();

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/finances/api/use-create-voucher', () => ({
  useCreateVoucher: () => ({
    mutateAsync: mockCreateVoucher,
  }),
}));

function renderDialog(onOpenChange = vi.fn()) {
  renderWithProviders(
    <AddVoucherDialog open onOpenChange={onOpenChange} ledgerOptions={ledgerOptions} />,
  );

  return { onOpenChange };
}

describe('AddVoucherDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateVoucher.mockResolvedValue(undefined);
  });

  it('renders the add voucher form when open', () => {
    renderDialog();

    expect(screen.getByRole('heading', { name: /add voucher/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^date$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/debit ledger/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/credit ledger/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^amount$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^narration$/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    renderDialog();

    await user.clear(screen.getByLabelText(/^date$/i));
    await user.click(screen.getByRole('button', { name: /add voucher/i }));

    expect(await screen.findByText(/select a valid date/i)).toBeInTheDocument();
    expect(screen.getByText(/select a debit ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/select a credit ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
  });

  it('rejects matching debit and credit ledgers', async () => {
    renderDialog();

    await selectComboboxOption('add-voucher-debit-ledger', 'Cash A/c');
    await selectComboboxOption('add-voucher-credit-ledger', 'Cash A/c');
    await user.type(screen.getByLabelText(/^amount$/i), '100');

    await user.click(screen.getByRole('button', { name: /add voucher/i }));

    expect(
      await screen.findByText(/debit and credit ledgers must be different/i),
    ).toBeInTheDocument();
    expect(mockCreateVoucher).not.toHaveBeenCalled();
  });

  it('rejects amounts below 0.01', async () => {
    renderDialog();

    await selectComboboxOption('add-voucher-debit-ledger', 'Cash A/c');
    await selectComboboxOption('add-voucher-credit-ledger', 'Bank A/c');
    await user.type(screen.getByLabelText(/^amount$/i), '0');

    await user.click(screen.getByRole('button', { name: /add voucher/i }));

    expect(await screen.findByText(/enter an amount of at least 0.01/i)).toBeInTheDocument();
    expect(mockCreateVoucher).not.toHaveBeenCalled();
  });

  it('submits a valid voucher and closes the dialog', async () => {
    const onOpenChange = vi.fn();
    renderDialog(onOpenChange);

    await selectComboboxOption('add-voucher-debit-ledger', 'Cash A/c');
    await selectComboboxOption('add-voucher-credit-ledger', 'Bank A/c');
    await user.type(screen.getByLabelText(/^amount$/i), '250.50');
    await user.type(screen.getByLabelText(/^narration$/i), 'Test voucher entry');

    await user.click(screen.getByRole('button', { name: /add voucher/i }));

    await waitFor(() => {
      expect(mockCreateVoucher).toHaveBeenCalledWith(
        expect.objectContaining({
          debitLedger: 'ledger-cash-id',
          creditLedger: 'ledger-bank-id',
          amount: 250.5,
          narration: 'Test voucher entry',
        }),
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Voucher created successfully', {
      position: 'bottom-right',
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('resets the form when cancelled', async () => {
    const onOpenChange = vi.fn();
    renderDialog(onOpenChange);

    const amountInput = screen.getByLabelText(/^amount$/i);
    await user.type(amountInput, '999');
    expect(amountInput).toHaveValue(999);

    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(amountInput).not.toHaveValue(999);

    await user.click(screen.getByRole('button', { name: /add voucher/i }));
    expect(await screen.findByText(/amount is required/i)).toBeInTheDocument();
  });

  it('omits narration from the create payload when cleared before submit', async () => {
    renderDialog();

    await selectComboboxOption('add-voucher-debit-ledger', 'Cash A/c');
    await selectComboboxOption('add-voucher-credit-ledger', 'Bank A/c');
    await user.type(screen.getByLabelText(/^amount$/i), '250.50');

    const narrationField = screen.getByLabelText(/^narration$/i);
    await user.type(narrationField, 'Temporary narration');
    await user.clear(narrationField);

    await user.click(screen.getByRole('button', { name: /add voucher/i }));

    await waitFor(() => {
      expect(mockCreateVoucher).toHaveBeenCalledWith(
        expect.objectContaining({
          debitLedger: 'ledger-cash-id',
          creditLedger: 'ledger-bank-id',
          amount: 250.5,
        }),
      );
    });
    expect(mockCreateVoucher.mock.calls[0]?.[0]).not.toHaveProperty('narration');
  });
});
