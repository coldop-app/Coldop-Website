import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import EditIncomingForm from '@/features/incoming/forms/edit-incoming-form';
import {
  FARMER_LINK_ID,
  GATE_PASS_ID,
  makeFarmerStorageLink,
  makeIncomingDaybookEntry,
  makePreferences,
  USER_ID,
} from '@/test/fixtures';
import { renderWithProviders, screen, user } from '@/test/test-utils';

const mockNavigate = vi.fn();
const mockUseIncomingDaybookEntry = vi.fn();
const mockUseFarmerStorageLinks = vi.fn();
const mockUsePreferencesStore = vi.fn();
const mockUseStoreAdminStore = vi.fn();
const mockIncomingForm = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({
    children,
    to,
    search,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    search?: unknown;
  }) => (
    <a
      href={to}
      onClick={(event) => {
        event.preventDefault();
        mockNavigate({ to, search });
      }}
      {...props}
    >
      {children}
    </a>
  ),
}));

vi.mock('@/features/incoming/api/use-incoming-daybook-entry', () => ({
  useIncomingDaybookEntry: (id: string) => mockUseIncomingDaybookEntry(id),
}));

vi.mock('@/features/people/api/use-farmer-storage-links', () => ({
  useFarmerStorageLinks: () => mockUseFarmerStorageLinks(),
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

function setupStores() {
  mockUseStoreAdminStore.mockImplementation((selector) =>
    selector({ storeAdmin: { _id: USER_ID } }),
  );
  mockUsePreferencesStore.mockImplementation((selector) =>
    selector({ preferences: makePreferences() }),
  );
}

function setupFarmerLinks(links = [makeFarmerStorageLink()], isLoading = false) {
  mockUseFarmerStorageLinks.mockReturnValue({
    data: links,
    isLoading,
    isError: false,
    error: null,
  });
}

describe('EditIncomingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStores();
    setupFarmerLinks();
  });

  it('shows not found when the entry is missing from cache', async () => {
    mockUseIncomingDaybookEntry.mockReturnValue(undefined);

    renderWithProviders(<EditIncomingForm gatePassId={GATE_PASS_ID} />);

    expect(screen.getByText('Gate pass not found')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /back to daybook/i }));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/daybook',
      search: DEFAULT_DAYBOOK_SEARCH,
    });
  });

  it('shows a skeleton while farmer links are loading', () => {
    mockUseIncomingDaybookEntry.mockReturnValue(makeIncomingDaybookEntry());
    setupFarmerLinks([], true);

    renderWithProviders(<EditIncomingForm gatePassId={GATE_PASS_ID} />);

    expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
    expect(screen.queryByTestId('incoming-form')).not.toBeInTheDocument();
  });

  it('shows a closed gate pass message when status is not OPEN', async () => {
    mockUseIncomingDaybookEntry.mockReturnValue(makeIncomingDaybookEntry({ status: 'CLOSED' }));

    renderWithProviders(<EditIncomingForm gatePassId={GATE_PASS_ID} />);

    expect(screen.getByText('Cannot edit closed gate pass')).toBeInTheDocument();
    expect(screen.getByText(/this pass is closed/i)).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /back to daybook/i }));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/daybook',
      search: DEFAULT_DAYBOOK_SEARCH,
    });
  });

  it('renders IncomingForm in edit mode when entry is open and farmers are loaded', () => {
    const entry = makeIncomingDaybookEntry({
      bagSizes: [
        {
          name: '50kg',
          initialQuantity: 120,
          currentQuantity: 120,
          location: {
            chamber: 'A',
            floor: '1',
            row: '3',
          },
          paltaiLocation: [
            {
              chamber: 'B',
              floor: '2',
              row: '4',
            },
          ],
        },
      ],
    });
    mockUseIncomingDaybookEntry.mockReturnValue(entry);

    renderWithProviders(<EditIncomingForm gatePassId={GATE_PASS_ID} />);

    expect(screen.getByTestId('incoming-form')).toBeInTheDocument();
    expect(mockIncomingForm).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'edit',
        gatePassId: GATE_PASS_ID,
        gatePassNo: entry.gatePassNo,
        gatePassNoReady: true,
        userId: USER_ID,
        originalBagSizes: entry.bagSizes,
        rentEntryVoucherId: entry.rentEntryVoucherId,
        editDefaultValues: expect.objectContaining({
          gatePassNo: entry.gatePassNo,
          farmerIncomingLinkId: FARMER_LINK_ID,
          variety: entry.variety,
          quantities: expect.arrayContaining([
            expect.objectContaining({
              paltaiLocations: [
                expect.objectContaining({
                  chamber: 'B',
                  floor: '2',
                  row: '4',
                }),
              ],
            }),
          ]),
        }),
        editBaselineValues: expect.objectContaining({
          gatePassNo: entry.gatePassNo,
        }),
      }),
    );
  });

  it('sets farmerLinkWarning when the farmer link cannot be matched', () => {
    const entry = makeIncomingDaybookEntry({
      farmerStorageLinkId: {
        name: 'Unknown Farmer',
        accountNumber: 999,
        address: 'Unknown',
        mobileNumber: '9000000000',
      },
    });

    mockUseIncomingDaybookEntry.mockReturnValue(entry);
    setupFarmerLinks([makeFarmerStorageLink()]);

    renderWithProviders(<EditIncomingForm gatePassId={GATE_PASS_ID} />);

    expect(mockIncomingForm).toHaveBeenCalledWith(
      expect.objectContaining({
        farmerLinkWarning:
          'Could not match farmer account from daybook. Select the correct farmer.',
        initialFarmerSearch: 'Unknown Farmer',
      }),
    );
  });

  it('builds initialFarmerSearch from the matched farmer link', () => {
    const farmerLink = makeFarmerStorageLink({
      _id: FARMER_LINK_ID,
      name: 'Rajesh Kumar',
      accountNumber: 101,
    });

    mockUseIncomingDaybookEntry.mockReturnValue(makeIncomingDaybookEntry());
    setupFarmerLinks([farmerLink]);

    renderWithProviders(<EditIncomingForm gatePassId={GATE_PASS_ID} />);

    expect(mockIncomingForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialFarmerSearch: 'Rajesh Kumar — Acct #101',
        farmerLinkWarning: undefined,
      }),
    );
  });
});
