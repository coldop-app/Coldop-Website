import { beforeEach, describe, expect, it, vi } from 'vitest';

import CreateIncomingForm from '@/features/incoming/forms/create-incoming-form';
import { makeFarmerStorageLink, makePreferences, USER_ID } from '@/test/fixtures';
import { renderWithProviders, screen } from '@/test/test-utils';

const mockRefetchGatePassNo = vi.fn();

const mockUseFarmerStorageLinks = vi.fn();
const mockUseNextGatePassNumber = vi.fn();
const mockUsePreferencesStore = vi.fn();
const mockUseStoreAdminStore = vi.fn();
const mockIncomingForm = vi.fn();

vi.mock('@/features/people/api/use-farmer-storage-links', () => ({
  useFarmerStorageLinks: () => mockUseFarmerStorageLinks(),
}));

vi.mock('@/hooks/use-next-gate-pass-number', () => ({
  useNextGatePassNumber: () => mockUseNextGatePassNumber(),
}));

vi.mock('@/features/auth/store/use-preferences-store', () => ({
  usePreferencesStore: (selector: (state: unknown) => unknown) => mockUsePreferencesStore(selector),
}));

vi.mock('@/features/auth/store/use-store-admin-store', () => ({
  useStoreAdminStore: (selector: (state: unknown) => unknown) => mockUseStoreAdminStore(selector),
}));

vi.mock('@/features/incoming/forms/incoming-form', () => ({
  IncomingForm: (props: unknown) => {
    mockIncomingForm(props);
    return <div data-testid="incoming-form" />;
  },
}));

vi.mock('@/features/daybook/components/daybook-back-button', () => ({
  DaybookBackButton: () => <div data-testid="daybook-back-button" />,
}));

function setupStores({
  userId = USER_ID,
  preferences = makePreferences(),
}: {
  userId?: string;
  preferences?: ReturnType<typeof makePreferences> | null;
} = {}) {
  mockUseStoreAdminStore.mockImplementation((selector) =>
    selector({ storeAdmin: userId ? { _id: userId } : null }),
  );
  mockUsePreferencesStore.mockImplementation((selector) => selector({ preferences }));
}

function setupReadyMocks() {
  const farmerLink = makeFarmerStorageLink();

  mockUseFarmerStorageLinks.mockReturnValue({
    data: [farmerLink],
    isLoading: false,
    isError: false,
    error: null,
  });

  mockUseNextGatePassNumber.mockReturnValue({
    nextNumber: 42,
    isLoading: false,
    isError: false,
    error: null,
    refetch: mockRefetchGatePassNo,
  });
}

describe('CreateIncomingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStores();
    setupReadyMocks();
  });

  it('shows a skeleton while the gate pass number is loading', () => {
    mockUseNextGatePassNumber.mockReturnValue({
      nextNumber: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetchGatePassNo,
    });

    renderWithProviders(<CreateIncomingForm />);

    expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
    expect(screen.queryByTestId('incoming-form')).not.toBeInTheDocument();
  });

  it('shows a skeleton when userId is missing', () => {
    setupStores({ userId: '' });

    renderWithProviders(<CreateIncomingForm />);

    expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
    expect(screen.queryByTestId('incoming-form')).not.toBeInTheDocument();
  });

  it('renders IncomingForm with create-mode props when data is ready', () => {
    renderWithProviders(<CreateIncomingForm />);

    expect(screen.getByTestId('incoming-form')).toBeInTheDocument();
    expect(mockIncomingForm).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'create',
        gatePassNo: 42,
        gatePassNoReady: true,
        userId: USER_ID,
        initialCommodity: 'Potato',
        initialBagSizes: ['50kg', 'Ration'],
        farmerStorageLinks: [makeFarmerStorageLink()],
        isFarmersLoading: false,
        isFarmersError: false,
        farmersError: null,
      }),
    );
  });

  it('forwards gate pass error props to IncomingForm', () => {
    const gatePassError = new Error('Failed to fetch gate pass number');

    mockUseNextGatePassNumber.mockReturnValue({
      nextNumber: 42,
      isLoading: false,
      isError: true,
      error: gatePassError,
      refetch: mockRefetchGatePassNo,
    });

    renderWithProviders(<CreateIncomingForm />);

    expect(mockIncomingForm).toHaveBeenCalledWith(
      expect.objectContaining({
        gatePassNoReady: false,
        gatePassNoError: gatePassError,
        onRefetchGatePassNo: expect.any(Function),
      }),
    );
  });
});
