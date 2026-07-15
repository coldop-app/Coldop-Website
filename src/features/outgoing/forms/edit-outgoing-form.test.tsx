import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import EditOutgoingForm from '@/features/outgoing/forms/edit-outgoing-form';
import { allocationKey } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';
import {
  FARMER_LINK_ID,
  GATE_PASS_ID,
  OUTGOING_GATE_PASS_ID,
  makeFarmerStorageLink,
  makeOutgoingDaybookEntry,
} from '@/test/fixtures';
import { renderWithProviders, screen, user, waitFor } from '@/test/test-utils';

const mockUseOutgoingDaybookEntry = vi.fn();
const mockUseFarmerStorageLinks = vi.fn();
const mockUseStorageGatePassesForFarmer = vi.fn();
const mockTransferGatePassesSection = vi.fn();
const mockNavigate = vi.fn();
const mockUpdateOutgoingGatePass = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/features/incoming/api/use-incoming-gate-passes-by-farmer-link', () => ({
  incomingGatePassesByFarmerLinkQueryKey: (farmerStorageLinkId: string) =>
    ['incoming-gate-passes-by-farmer-link', farmerStorageLinkId] as const,
}));

vi.mock('@/features/outgoing/api/use-outgoing-daybook-entry', () => ({
  useOutgoingDaybookEntry: (id: string) => mockUseOutgoingDaybookEntry(id),
}));

vi.mock('@/features/people/api/use-farmer-storage-links', () => ({
  useFarmerStorageLinks: () => mockUseFarmerStorageLinks(),
}));

vi.mock('@/features/transfer-stock/hooks/use-storage-gate-passes-for-farmer', () => ({
  useStorageGatePassesForFarmer: (farmerStorageLinkId: string) =>
    mockUseStorageGatePassesForFarmer(farmerStorageLinkId),
}));

vi.mock('@/features/transfer-stock/forms/transfer-gate-passes-section', () => ({
  TransferGatePassesSection: (props: {
    onAllocationsChange: (value: Record<string, number>) => void;
    allocations: Record<string, number>;
  }) => {
    mockTransferGatePassesSection(props);
    return (
      <div data-testid="transfer-gate-passes-section">
        <button
          type="button"
          data-testid="set-allocation"
          onClick={() =>
            props.onAllocationsChange({
              ...props.allocations,
              [allocationKey(GATE_PASS_ID, '50kg', 0)]: 80,
            })
          }
        >
          Set allocation
        </button>
      </div>
    );
  },
}));

vi.mock('@/features/daybook/components/daybook-back-button', () => ({
  DaybookBackButton: () => <div data-testid="daybook-back-button" />,
}));

vi.mock('@/features/auth/store/use-preferences-store', () => ({
  usePreferencesStore: (selector: (state: unknown) => unknown) => selector({ preferences: null }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/features/outgoing/api/use-update-outgoing-gate-pass', () => ({
  useUpdateOutgoingGatePass: () => ({
    mutateAsync: mockUpdateOutgoingGatePass,
    isPending: false,
  }),
}));

vi.mock('@/features/outgoing/forms/outgoing-summary-sheet', () => ({
  OutgoingSummarySheet: ({
    open,
    onBack,
    onSubmit,
  }: {
    open: boolean;
    onBack: () => void;
    onSubmit: () => void;
  }) =>
    open ? (
      <div data-testid="outgoing-summary">
        <button type="button" onClick={onBack}>
          Back
        </button>
        <button type="button" onClick={onSubmit}>
          Confirm
        </button>
      </div>
    ) : null,
}));

const storagePass: StorageGatePass = {
  _id: GATE_PASS_ID,
  farmerStorageLinkId: FARMER_LINK_ID,
  accountNumber: 101,
  gatePassNo: 12,
  date: '2026-06-01T00:00:00.000Z',
  variety: 'Kufri Jyoti',
  storageCategory: 'Local',
  bagSizes: [
    {
      size: '50kg',
      currentQuantity: 70,
      initialQuantity: 120,
      bagType: 'Local',
      chamber: 'A',
      floor: '1',
      row: '3',
    },
  ],
  remarks: '',
};

function setupLoadedEntry(entryOverrides: Parameters<typeof makeOutgoingDaybookEntry>[0] = {}) {
  mockUseOutgoingDaybookEntry.mockReturnValue(makeOutgoingDaybookEntry(entryOverrides));
  mockUseFarmerStorageLinks.mockReturnValue({
    data: [makeFarmerStorageLink()],
    isLoading: false,
    isError: false,
    error: null,
  });
  mockUseStorageGatePassesForFarmer.mockReturnValue({
    data: [storagePass],
    isLoading: false,
    error: null,
  });
}

const handledSubmitRejections = new Set<string>();

beforeAll(() => {
  process.on('unhandledRejection', (reason: unknown) => {
    if (reason instanceof Error && handledSubmitRejections.has(reason.message)) {
      handledSubmitRejections.delete(reason.message);
    }
  });
});

describe('EditOutgoingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateOutgoingGatePass.mockResolvedValue({ gatePassNo: 24 });
    mockUseFarmerStorageLinks.mockReturnValue({
      data: [makeFarmerStorageLink()],
      isLoading: false,
      isError: false,
      error: null,
    });
    mockUseStorageGatePassesForFarmer.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
  });

  it('shows not found when the entry is missing from cache', () => {
    mockUseOutgoingDaybookEntry.mockReturnValue(undefined);

    renderWithProviders(<EditOutgoingForm gatePassId={OUTGOING_GATE_PASS_ID} />);

    expect(screen.getByText('Gate pass not found')).toBeInTheDocument();
  });

  it('shows a skeleton while storage passes are loading', () => {
    mockUseOutgoingDaybookEntry.mockReturnValue(makeOutgoingDaybookEntry());
    mockUseFarmerStorageLinks.mockReturnValue({
      data: [makeFarmerStorageLink()],
      isLoading: false,
      isError: false,
      error: null,
    });
    mockUseStorageGatePassesForFarmer.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    renderWithProviders(<EditOutgoingForm gatePassId={OUTGOING_GATE_PASS_ID} />);

    expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
    expect(screen.queryByTestId('transfer-gate-passes-section')).not.toBeInTheDocument();
  });

  it('shows cannot edit when the entry is null', () => {
    mockUseOutgoingDaybookEntry.mockReturnValue(makeOutgoingDaybookEntry({ isNull: true }));

    renderWithProviders(<EditOutgoingForm gatePassId={OUTGOING_GATE_PASS_ID} />);

    expect(screen.getByText('Cannot edit null gate pass')).toBeInTheDocument();
  });

  it('renders OGP number and passes edit allocation mode to the matrix', () => {
    setupLoadedEntry();

    renderWithProviders(<EditOutgoingForm gatePassId={OUTGOING_GATE_PASS_ID} />);

    expect(screen.getByText(/edit outgoing/i)).toBeInTheDocument();
    expect(screen.getByText('#24')).toBeInTheDocument();
    expect(screen.getByTestId('transfer-gate-passes-section')).toBeInTheDocument();

    const allocationKeyValue = allocationKey(GATE_PASS_ID, '50kg', 0);

    expect(mockTransferGatePassesSection).toHaveBeenCalledWith(
      expect.objectContaining({
        fromFarmerStorageLinkId: FARMER_LINK_ID,
        varietyFilterMode: 'multi-optional',
        initialVariety: 'Kufri Jyoti',
        allocationMode: 'edit',
        baselineAllocations: { [allocationKeyValue]: 50 },
        allocations: { [allocationKeyValue]: 50 },
      }),
    );
  });

  it('resolves farmer link by account number when daybook _id is missing', () => {
    setupLoadedEntry({
      farmerStorageLinkId: {
        name: 'Rajesh Kumar',
        accountNumber: 101,
        address: 'Village Rampur, Karnal',
        mobileNumber: '9876543210',
      },
    });

    renderWithProviders(<EditOutgoingForm gatePassId={OUTGOING_GATE_PASS_ID} />);

    expect(screen.getByText(/edit outgoing/i)).toBeInTheDocument();
    expect(mockTransferGatePassesSection).toHaveBeenCalledWith(
      expect.objectContaining({
        fromFarmerStorageLinkId: FARMER_LINK_ID,
      }),
    );
  });

  it('PATCHes header-only changes after review and confirm', async () => {
    setupLoadedEntry();
    renderWithProviders(<EditOutgoingForm gatePassId={OUTGOING_GATE_PASS_ID} />);

    const truckField = screen.getByLabelText(/truck number/i);
    await user.clear(truckField);
    await user.type(truckField, 'HR-26-XY-9999');

    await user.click(screen.getByRole('button', { name: /review changes/i }));
    expect(await screen.findByTestId('outgoing-summary')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(mockUpdateOutgoingGatePass).toHaveBeenCalledTimes(1);
    });

    expect(mockUpdateOutgoingGatePass).toHaveBeenCalledWith({
      id: OUTGOING_GATE_PASS_ID,
      payload: { truckNumber: 'HR-26-XY-9999' },
    });
    expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/outgoing #24 updated/i), {
      position: 'bottom-right',
    });
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/daybook',
      search: DEFAULT_DAYBOOK_SEARCH,
    });
  });

  it('PATCHes combined header and allocation changes', async () => {
    setupLoadedEntry();
    renderWithProviders(<EditOutgoingForm gatePassId={OUTGOING_GATE_PASS_ID} />);

    await screen.findByTestId('transfer-gate-passes-section');

    const truckField = screen.getByLabelText(/truck number/i);
    await user.clear(truckField);
    await user.type(truckField, 'HR-26-XY-9999');
    await user.click(screen.getByTestId('set-allocation'));

    await user.click(screen.getByRole('button', { name: /review changes/i }));
    await screen.findByTestId('outgoing-summary');
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(mockUpdateOutgoingGatePass).toHaveBeenCalledTimes(1);
    });

    const call = mockUpdateOutgoingGatePass.mock.calls[0]?.[0];
    expect(call?.id).toBe(OUTGOING_GATE_PASS_ID);
    expect(call?.payload.truckNumber).toBe('HR-26-XY-9999');
    expect(call?.payload.incomingGatePasses).toEqual([
      {
        incomingGatePassId: GATE_PASS_ID,
        variety: 'Kufri Jyoti',
        allocations: [
          {
            size: '50kg',
            quantityToAllocate: 80,
            location: { chamber: 'A', floor: '1', row: '3' },
          },
        ],
      },
    ]);
  });

  it('merges zero-quantity snapshot passes into the gate pass matrix', () => {
    setupLoadedEntry();
    mockUseStorageGatePassesForFarmer.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<EditOutgoingForm gatePassId={OUTGOING_GATE_PASS_ID} />);

    const allocationKeyValue = allocationKey(GATE_PASS_ID, '50kg', 0);

    expect(mockTransferGatePassesSection).toHaveBeenCalledWith(
      expect.objectContaining({
        allocationMode: 'edit',
        baselineAllocations: { [allocationKeyValue]: 50 },
        allocations: { [allocationKeyValue]: 50 },
        passesOverride: [
          expect.objectContaining({
            _id: GATE_PASS_ID,
            gatePassNo: 12,
            variety: 'Kufri Jyoti',
            bagSizes: [
              expect.objectContaining({
                size: '50kg',
                currentQuantity: 0,
                initialQuantity: 120,
                chamber: 'A',
                floor: '1',
                row: '3',
              }),
            ],
          }),
        ],
      }),
    );
  });

  it('shows an error toast when update fails and keeps the review sheet open', async () => {
    handledSubmitRejections.add('Insufficient stock');
    mockUpdateOutgoingGatePass.mockRejectedValue(new Error('Insufficient stock'));

    setupLoadedEntry();
    renderWithProviders(<EditOutgoingForm gatePassId={OUTGOING_GATE_PASS_ID} />);

    const truckField = screen.getByLabelText(/truck number/i);
    await user.clear(truckField);
    await user.type(truckField, 'HR-26-XY-9999');

    await user.click(screen.getByRole('button', { name: /review changes/i }));
    await screen.findByTestId('outgoing-summary');
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Insufficient stock', {
        position: 'bottom-right',
      });
    });

    expect(screen.getByTestId('outgoing-summary')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
