import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import { EditFarmerDialog } from '@/features/people/components/edit-farmer-dialog';
import { makeFarmerStorageLink, makePreferences } from '@/test/fixtures';
import { renderWithProviders, screen, user, waitFor } from '@/test/test-utils';

const mockMutateAsync = vi.fn();
const mockUseUpdateFarmerStorageLink = vi.fn();
const mockUsePreferencesStore = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/people/api/use-update-farmer-storage-link', () => ({
  useUpdateFarmerStorageLink: () => mockUseUpdateFarmerStorageLink(),
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

function renderDialog(props: Partial<React.ComponentProps<typeof EditFarmerDialog>> = {}) {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();
  const link = props.link ?? makeFarmerStorageLink();
  const links = props.links ?? [link];

  renderWithProviders(
    <EditFarmerDialog
      open={props.open ?? true}
      onOpenChange={props.onOpenChange ?? onOpenChange}
      link={link}
      links={links}
      onSuccess={props.onSuccess ?? onSuccess}
    />,
  );

  return { onOpenChange, onSuccess, link };
}

describe('EditFarmerDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupPreferences(true);
    mockUseUpdateFarmerStorageLink.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('does not render content when closed', () => {
    renderDialog({ open: false });

    expect(screen.queryByRole('heading', { name: /edit farmer/i })).not.toBeInTheDocument();
  });

  it('renders prefilled values from the farmer link', () => {
    renderDialog({
      link: makeFarmerStorageLink({
        accountNumber: 1042,
        name: 'Ramesh Kumar',
        mobileNumber: '9812345678',
        address: 'Village Rampur, Block Meerut, UP',
        costPerBag: 125,
      }),
    });

    expect(screen.getByRole('heading', { name: /edit farmer/i })).toBeInTheDocument();
    expect(document.getElementById('accountNumber')).toHaveValue(1042);
    expect(screen.getByPlaceholderText(/enter 10-digit mobile number/i)).toHaveValue('9812345678');
    expect(screen.getByPlaceholderText(/enter farmer name/i)).toHaveValue('Ramesh Kumar');
    expect(screen.getByPlaceholderText(/enter address/i)).toHaveValue(
      'Village Rampur, Block Meerut, UP',
    );
    expect(screen.getByPlaceholderText(/^110$/i)).toHaveValue(125);
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('hides finance fields when showFinances is false', () => {
    setupPreferences(false);
    renderDialog();

    expect(screen.queryByLabelText(/cost per bag/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/opening balance/i)).not.toBeInTheDocument();
  });

  it('allows keeping the same account number and mobile for the edited farmer', async () => {
    const link = makeFarmerStorageLink({
      _id: '674a1b2c3d4e5f6789012345',
      accountNumber: 101,
      mobileNumber: '9876543210',
    });
    const otherLink = makeFarmerStorageLink({
      _id: '674b2c3d4e5f6789012346',
      accountNumber: 102,
      mobileNumber: '9123456789',
    });

    renderDialog({ link, links: [link, otherLink] });

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });

    expect(screen.queryByText(/this account number is already in use/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/this mobile number is already linked to a farmer/i),
    ).not.toBeInTheDocument();
  });

  it('shows duplicate account number validation for another farmer', async () => {
    const link = makeFarmerStorageLink({
      _id: '674a1b2c3d4e5f6789012345',
      accountNumber: 101,
      mobileNumber: '9876543210',
    });
    const otherLink = makeFarmerStorageLink({
      _id: '674b2c3d4e5f6789012346',
      accountNumber: 102,
      mobileNumber: '9123456789',
    });

    renderDialog({ link, links: [link, otherLink] });

    const accountInput = document.getElementById('accountNumber')!;
    await user.clear(accountInput);
    await user.type(accountInput, '102');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/this account number is already in use/i)).toBeInTheDocument();
  });

  it('shows duplicate mobile number validation for another farmer', async () => {
    const link = makeFarmerStorageLink({
      _id: '674a1b2c3d4e5f6789012345',
      accountNumber: 101,
      mobileNumber: '9876543210',
    });
    const otherLink = makeFarmerStorageLink({
      _id: '674b2c3d4e5f6789012346',
      accountNumber: 102,
      mobileNumber: '9123456789',
    });

    renderDialog({ link, links: [link, otherLink] });

    const mobileInput = screen.getByPlaceholderText(/enter 10-digit mobile number/i);
    await user.clear(mobileInput);
    await user.type(mobileInput, '9123456789');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(
      await screen.findByText(/this mobile number is already linked to a farmer/i),
    ).toBeInTheDocument();
  });

  it('submits successfully and closes the dialog', async () => {
    const link = makeFarmerStorageLink({
      _id: '674a1b2c3d4e5f6789012345',
      accountNumber: 101,
      name: 'Rajesh Kumar',
      mobileNumber: '9876543210',
      address: 'Village Rampur, Karnal',
      costPerBag: 110,
    });
    const updatedLink = makeFarmerStorageLink({
      ...link,
      name: 'Updated Farmer',
      address: 'New Address',
    });

    mockMutateAsync.mockResolvedValue({
      message: 'Farmer-storage-link updated successfully',
      data: updatedLink,
    });

    const { onOpenChange, onSuccess } = renderDialog({ link });

    const nameInput = screen.getByPlaceholderText(/enter farmer name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Farmer');

    const addressInput = screen.getByPlaceholderText(/enter address/i);
    await user.clear(addressInput);
    await user.type(addressInput, 'New Address');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: link._id,
        payload: expect.objectContaining({
          name: 'Updated Farmer',
          address: 'New Address',
          mobileNumber: '9876543210',
          accountNumber: 101,
          costPerBag: 110,
        }),
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Farmer-storage-link updated successfully', {
      position: 'bottom-right',
    });
    expect(onSuccess).toHaveBeenCalledWith(updatedLink);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows an error toast when submission fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'));

    const { onOpenChange } = renderDialog();

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error', {
        position: 'bottom-right',
      });
    });

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('heading', { name: /edit farmer/i })).toBeInTheDocument();
  });
});
