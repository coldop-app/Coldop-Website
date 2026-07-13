import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import { AddLedgerDialog } from '@/features/finances/components/ledger-tab/add-ledger-dialog';
import { addLedgerFormSchema } from '@/features/finances/components/ledger-tab/schemas/add-ledger-form-schema';
import {
  renderWithProviders,
  screen,
  selectComboboxOption,
  user,
  waitFor,
} from '@/test/test-utils';

const mockCreateLedger = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/finances/api/use-create-ledger', () => ({
  useCreateLedger: () => ({
    mutateAsync: mockCreateLedger,
  }),
}));

function renderDialog(onOpenChange = vi.fn()) {
  renderWithProviders(<AddLedgerDialog open onOpenChange={onOpenChange} />);

  return { onOpenChange };
}

describe('AddLedgerDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateLedger.mockResolvedValue(undefined);
  });

  it('renders the add ledger form when open', () => {
    renderDialog();

    expect(screen.getByRole('heading', { name: /add ledger/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^type$/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    renderDialog();

    await user.click(screen.getByRole('button', { name: /add ledger/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/select a type/i)).toBeInTheDocument();
    expect(screen.getByText(/select a sub type/i)).toBeInTheDocument();
    expect(screen.getByText(/select a category/i)).toBeInTheDocument();
  });

  it('cascades type selection into sub type and category fields', async () => {
    renderDialog();

    const subTypeInput = screen.getByLabelText(/sub type/i);
    expect(subTypeInput).toHaveTextContent('Select type first');

    await selectComboboxOption('add-ledger-type', 'Asset');

    expect(subTypeInput).toHaveTextContent('Search sub types...');

    await selectComboboxOption('add-ledger-sub-type', 'Current Assets');

    expect(screen.getByLabelText(/category/i)).toHaveTextContent('Search categories...');

    await selectComboboxOption('add-ledger-type', 'Liability');

    expect(subTypeInput).toHaveTextContent('Search sub types...');
    expect(screen.getByLabelText(/category/i)).toHaveTextContent('Select type and sub type first');
  });

  it('submits a valid ledger and closes the dialog', async () => {
    const onOpenChange = vi.fn();
    renderDialog(onOpenChange);

    await user.type(screen.getByLabelText(/^name$/i), 'Cash A/c');
    await selectComboboxOption('add-ledger-type', 'Asset');
    await selectComboboxOption('add-ledger-sub-type', 'Current Assets');
    await selectComboboxOption('add-ledger-category', 'Cash');
    await user.type(screen.getByLabelText(/opening balance/i), '1000');

    await user.click(screen.getByRole('button', { name: /add ledger/i }));

    await waitFor(() => {
      expect(mockCreateLedger).toHaveBeenCalledWith({
        name: 'Cash A/c',
        type: 'Asset',
        subType: 'Current Assets',
        category: 'Cash',
        openingBalance: 1000,
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Ledger created successfully', {
      position: 'bottom-right',
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('resets the form when cancelled', async () => {
    const onOpenChange = vi.fn();
    renderDialog(onOpenChange);

    await user.type(screen.getByLabelText(/^name$/i), 'Temporary Ledger');
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByLabelText(/^name$/i)).toHaveValue('');

    await user.click(screen.getByRole('button', { name: /add ledger/i }));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  it('rejects invalid opening balance values in form validation', () => {
    const result = addLedgerFormSchema.safeParse({
      name: 'Cash A/c',
      type: 'Asset',
      subType: 'Current Assets',
      category: 'Cash',
      openingBalance: 'abc',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'Enter a valid amount')).toBe(
        true,
      );
    }
  });

  it('omits opening balance from the create payload when cleared before submit', async () => {
    renderDialog();

    await user.type(screen.getByLabelText(/^name$/i), 'Cash A/c');
    await selectComboboxOption('add-ledger-type', 'Asset');
    await selectComboboxOption('add-ledger-sub-type', 'Current Assets');
    await selectComboboxOption('add-ledger-category', 'Cash');

    const openingBalanceInput = screen.getByLabelText(/opening balance/i);
    await user.type(openingBalanceInput, '1000');
    await user.clear(openingBalanceInput);

    await user.click(screen.getByRole('button', { name: /add ledger/i }));

    await waitFor(() => {
      expect(mockCreateLedger).toHaveBeenCalledWith({
        name: 'Cash A/c',
        type: 'Asset',
        subType: 'Current Assets',
        category: 'Cash',
      });
    });
    expect(mockCreateLedger.mock.calls[0]?.[0]).not.toHaveProperty('openingBalance');
  });
});
