import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import { AddFarmerDialog } from '@/features/people/components/add-farmer-dialog';
import { makeFarmerStorageLink, makePreferences } from '@/test/fixtures';
import { renderWithProviders, screen, user, waitFor } from '@/test/test-utils';

const mockMutateAsync = vi.fn();
const mockUseQuickRegisterFarmer = vi.fn();
const mockUsePreferencesStore = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/people/api/use-quick-register-farmer', () => ({
  useQuickRegisterFarmer: () => mockUseQuickRegisterFarmer(),
}));

vi.mock('@/features/auth/store/use-preferences-store', () => ({
  usePreferencesStore: (selector: (state: unknown) => unknown) => mockUsePreferencesStore(selector),
}));

function setupPreferences(showFinances = true) {
  mockUsePreferencesStore.mockImplementation((selector) =>
    selector({
      preferences: makePreferences({ showFinances }),
    }),
  );
}

function renderDialog(props: Partial<React.ComponentProps<typeof AddFarmerDialog>> = {}) {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();
  const links = props.links ?? [makeFarmerStorageLink()];

  renderWithProviders(
    <AddFarmerDialog
      open={props.open ?? true}
      onOpenChange={props.onOpenChange ?? onOpenChange}
      links={links}
      onSuccess={props.onSuccess ?? onSuccess}
    />,
  );

  return { onOpenChange, onSuccess };
}

async function fillValidFarmerForm() {
  await user.type(screen.getByPlaceholderText(/enter 10-digit mobile number/i), '9812345678');
  await user.type(screen.getByPlaceholderText(/enter farmer name/i), 'New Farmer');
  await user.type(screen.getByPlaceholderText(/enter address/i), 'Test Address');
  await user.type(screen.getByPlaceholderText(/^110$/i), '110');
}

describe('AddFarmerDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupPreferences(true);
    mockUseQuickRegisterFarmer.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('does not render content when closed', () => {
    renderDialog({ open: false });

    expect(screen.queryByRole('heading', { name: /add farmer/i })).not.toBeInTheDocument();
  });

  it('renders the form when open with finance fields enabled', () => {
    renderDialog();

    expect(screen.getByRole('heading', { name: /add farmer/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cost per bag/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/opening balance/i)).toBeInTheDocument();
  });

  it('hides finance fields when showFinances is false', () => {
    setupPreferences(false);
    renderDialog();

    expect(screen.queryByLabelText(/cost per bag/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/opening balance/i)).not.toBeInTheDocument();
  });

  it('shows required field errors when submitting an empty form', async () => {
    renderDialog();

    await user.click(screen.getByRole('button', { name: /save farmer/i }));

    expect(await screen.findByText(/enter a valid 10-digit mobile number/i)).toBeInTheDocument();
    expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/cost per bag is required/i)).toBeInTheDocument();
  });

  it('sanitizes mobile number input to digits only', async () => {
    renderDialog();

    const mobileInput = screen.getByPlaceholderText(/enter 10-digit mobile number/i);
    await user.click(mobileInput);
    await user.paste('98abc76543210');

    expect(mobileInput).toHaveValue('9876543210');
  });

  it('fills the suggested account number when Use suggested is clicked', async () => {
    renderDialog({ links: [makeFarmerStorageLink({ accountNumber: 101 })] });

    await user.click(screen.getByRole('button', { name: /use suggested/i }));

    expect(document.getElementById('accountNumber')).toHaveValue(102);
  });

  it('shows duplicate account number validation', async () => {
    renderDialog({ links: [makeFarmerStorageLink({ accountNumber: 101 })] });

    await user.type(document.getElementById('accountNumber')!, '101');
    await user.click(screen.getByRole('button', { name: /save farmer/i }));

    expect(await screen.findByText(/this account number is already in use/i)).toBeInTheDocument();
  });

  it('shows duplicate mobile number validation', async () => {
    renderDialog({ links: [makeFarmerStorageLink({ mobileNumber: '9876543210' })] });

    await user.type(screen.getByPlaceholderText(/enter 10-digit mobile number/i), '9876543210');
    await user.type(screen.getByPlaceholderText(/enter farmer name/i), 'Duplicate Mobile');
    await user.type(screen.getByPlaceholderText(/enter address/i), 'Test Address');
    await user.type(screen.getByPlaceholderText(/^110$/i), '110');
    await user.click(screen.getByRole('button', { name: /save farmer/i }));

    expect(
      await screen.findByText(/this mobile number is already linked to a farmer/i),
    ).toBeInTheDocument();
  });

  it('submits successfully and closes the dialog', async () => {
    const createdLink = makeFarmerStorageLink({
      _id: '674c8a1b2d3e4f5678908888',
      name: 'New Farmer',
      mobileNumber: '9812345678',
    });
    mockMutateAsync.mockResolvedValue({
      message: 'Farmer added successfully',
      data: createdLink,
    });

    const { onOpenChange, onSuccess } = renderDialog();

    await fillValidFarmerForm();
    await user.click(screen.getByRole('button', { name: /save farmer/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Farmer',
          address: 'Test Address',
          mobileNumber: '9812345678',
          costPerBag: 110,
        }),
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Farmer added successfully', {
      position: 'bottom-right',
    });
    expect(onSuccess).toHaveBeenCalledWith(createdLink);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows an error toast when submission fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'));

    const { onOpenChange } = renderDialog();

    await fillValidFarmerForm();
    await user.click(screen.getByRole('button', { name: /save farmer/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error', {
        position: 'bottom-right',
      });
    });

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('heading', { name: /add farmer/i })).toBeInTheDocument();
  });

  it('omits opening balance from the payload when cleared before submit', async () => {
    mockMutateAsync.mockResolvedValue({
      message: 'Farmer added successfully',
      data: makeFarmerStorageLink(),
    });

    renderDialog();

    await fillValidFarmerForm();

    const openingBalanceInput = screen.getByLabelText(/opening balance/i);
    await user.type(openingBalanceInput, '500');
    await user.clear(openingBalanceInput);

    await user.click(screen.getByRole('button', { name: /save farmer/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Farmer',
          address: 'Test Address',
          mobileNumber: '9812345678',
          costPerBag: 110,
        }),
      );
    });
    expect(mockMutateAsync.mock.calls[0]?.[0]).not.toHaveProperty('openingBalance');
  });
});
