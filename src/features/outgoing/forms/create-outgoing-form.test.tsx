import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import type { IncomingGatePassRecord } from '@/features/incoming/types/api';
import CreateOutgoingForm from '@/features/outgoing/forms/create-outgoing-form';
import { incomingGatePassesByFarmerLinkQueryKey } from '@/features/incoming/api/use-incoming-gate-passes-by-farmer-link';
import { allocationKey } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { FARMER_LINK_ID, makeFarmerStorageLink } from '@/test/fixtures';
import {
  renderWithProviders,
  screen,
  selectComboboxOption,
  user,
  waitFor,
} from '@/test/test-utils';

const STORAGE_PASS_ID = '674a1b2c3d4e5f6789012346';

const mockNavigate = vi.fn();
const mockUseFarmerStorageLinks = vi.fn();
const mockUseNextGatePassNumber = vi.fn();
const mockCreateOutgoingGatePass = vi.fn();

const mockTransferGatePassesSection = vi.fn(
  ({
    onAllocationsChange,
    varietyFilterMode,
  }: {
    onAllocationsChange: (value: Record<string, number>) => void;
    varietyFilterMode?: string;
  }) => (
    <div data-testid="transfer-gate-passes-section" data-variety-mode={varietyFilterMode}>
      <button
        type="button"
        data-testid="set-allocation"
        onClick={() =>
          onAllocationsChange({
            [allocationKey(STORAGE_PASS_ID, '50kg', 0)]: 10,
          })
        }
      >
        Set allocation
      </button>
    </div>
  ),
);

vi.mock('@/features/transfer-stock/forms/transfer-gate-passes-section', () => ({
  TransferGatePassesSection: (props: {
    onAllocationsChange: (value: Record<string, number>) => void;
    varietyFilterMode?: string;
  }) => mockTransferGatePassesSection(props),
}));

vi.mock('@/features/auth/store/use-preferences-store', () => ({
  usePreferencesStore: (selector: (state: unknown) => unknown) => selector({ preferences: null }),
}));

vi.mock('@/features/daybook/components/daybook-back-button', () => ({
  DaybookBackButton: () => <div data-testid="daybook-back-button" />,
}));

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

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/people/api/use-farmer-storage-links', () => ({
  useFarmerStorageLinks: () => mockUseFarmerStorageLinks(),
}));

vi.mock('@/hooks/use-next-gate-pass-number', () => ({
  useNextGatePassNumber: () => mockUseNextGatePassNumber(),
}));

vi.mock('@/features/outgoing/api/use-create-outgoing-gate-pass', () => ({
  useCreateOutgoingGatePass: () => ({
    mutateAsync: mockCreateOutgoingGatePass,
  }),
}));

vi.mock('@/features/transfer-stock/hooks/use-storage-gate-passes-for-farmer', () => ({
  useStorageGatePassesForFarmer: () => ({ data: [] }),
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

function makeIncomingGatePassRecord(
  overrides: Partial<IncomingGatePassRecord> & { _id?: string; variety?: string } = {},
): IncomingGatePassRecord {
  return {
    _id: STORAGE_PASS_ID,
    farmerStorageLinkId: {
      _id: FARMER_LINK_ID,
      name: 'Rajesh Kumar',
      accountNumber: 101,
      address: 'Village Rampur, Karnal',
      mobileNumber: '9876543210',
    },
    createdBy: { _id: '662f9a8b7c6d5e4f32109876', name: 'Store Admin' },
    gatePassNo: 12,
    date: '2026-06-01T00:00:00.000Z',
    type: 'RECEIPT',
    variety: 'Kufri Jyoti',
    bagSizes: [
      {
        name: '50kg',
        initialQuantity: 120,
        currentQuantity: 120,
        location: { chamber: 'A', floor: '1', row: '3' },
      },
    ],
    status: 'OPEN',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
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
    refetch: vi.fn(),
  });
}

async function selectFarmerOption(label: string) {
  await selectComboboxOption('outgoing-farmer', label);
}

function seedIncomingPasses(
  queryClient: ReturnType<typeof renderWithProviders>['queryClient'],
  records: IncomingGatePassRecord[] = [makeIncomingGatePassRecord()],
) {
  queryClient.setQueryData(incomingGatePassesByFarmerLinkQueryKey(FARMER_LINK_ID), records);
}

const handledSubmitRejections = new Set<string>();

beforeAll(() => {
  process.on('unhandledRejection', (reason: unknown) => {
    if (reason instanceof Error && handledSubmitRejections.has(reason.message)) {
      handledSubmitRejections.delete(reason.message);
    }
  });
});

describe('CreateOutgoingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupReadyMocks();
    mockCreateOutgoingGatePass.mockResolvedValue({ gatePassNo: 42 });
    vi.stubGlobal('crypto', {
      randomUUID: () => 'outgoing-test-uuid',
    });
  });

  it('shows ellipsis in the title while the gate pass number is loading', () => {
    mockUseNextGatePassNumber.mockReturnValue({
      nextNumber: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<CreateOutgoingForm />);

    expect(screen.getByText('#…')).toBeInTheDocument();
  });

  it('shows the gate pass number when ready', () => {
    renderWithProviders(<CreateOutgoingForm />);

    expect(screen.getByText('#42')).toBeInTheDocument();
  });

  it('shows a dash in the title when the gate pass number fails to load', () => {
    mockUseNextGatePassNumber.mockReturnValue({
      nextNumber: null,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
      refetch: vi.fn(),
    });

    renderWithProviders(<CreateOutgoingForm />);

    expect(screen.getByText('#—')).toBeInTheDocument();
  });

  it('disables Review while the gate pass number is loading', () => {
    mockUseNextGatePassNumber.mockReturnValue({
      nextNumber: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<CreateOutgoingForm />);

    expect(screen.getByRole('button', { name: /review/i })).toBeDisabled();
  });

  it('disables Review when the gate pass number errored', () => {
    mockUseNextGatePassNumber.mockReturnValue({
      nextNumber: null,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
      refetch: vi.fn(),
    });

    renderWithProviders(<CreateOutgoingForm />);

    expect(screen.getByRole('button', { name: /review/i })).toBeDisabled();
  });

  it('enables Review when the gate pass number is ready', () => {
    renderWithProviders(<CreateOutgoingForm />);

    expect(screen.getByRole('button', { name: /review/i })).toBeEnabled();
  });

  it('shows a farmer fetch error message', () => {
    mockUseFarmerStorageLinks.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      error: new Error('Failed to load farmers'),
    });

    renderWithProviders(<CreateOutgoingForm />);

    expect(screen.getByText('Failed to load farmers')).toBeInTheDocument();
  });

  it('does not open the review sheet when the form is invalid', async () => {
    renderWithProviders(<CreateOutgoingForm />);

    await user.click(screen.getByRole('button', { name: /review/i }));

    expect(screen.queryByTestId('outgoing-summary')).not.toBeInTheDocument();
  });

  it('creates an outgoing gate pass after review and confirm', async () => {
    const farmerLabel = 'Rajesh Kumar — Acct #101';
    const { queryClient } = renderWithProviders(<CreateOutgoingForm />);

    await selectFarmerOption(farmerLabel);
    seedIncomingPasses(queryClient);

    await user.click(screen.getByTestId('set-allocation'));
    await user.click(screen.getByRole('button', { name: /review/i }));

    expect(await screen.findByTestId('outgoing-summary')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(mockCreateOutgoingGatePass).toHaveBeenCalledTimes(1);
    });

    expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/outgoing #42 created/i), {
      position: 'bottom-right',
    });
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/daybook',
      search: DEFAULT_DAYBOOK_SEARCH,
    });
    expect(screen.queryByTestId('outgoing-summary')).not.toBeInTheDocument();
  });

  it('shows an error toast when create fails and keeps the review sheet open', async () => {
    handledSubmitRejections.add('Create failed');
    mockCreateOutgoingGatePass.mockRejectedValue(new Error('Create failed'));

    const farmerLabel = 'Rajesh Kumar — Acct #101';
    const { queryClient } = renderWithProviders(<CreateOutgoingForm />);

    await selectFarmerOption(farmerLabel);
    seedIncomingPasses(queryClient);
    await user.click(screen.getByTestId('set-allocation'));
    await user.click(screen.getByRole('button', { name: /review/i }));
    await screen.findByTestId('outgoing-summary');
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Create failed', {
        position: 'bottom-right',
      });
    });

    expect(screen.getByTestId('outgoing-summary')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('resets the farmer field when Reset form is clicked', async () => {
    const farmerLabel = 'Rajesh Kumar — Acct #101';
    renderWithProviders(<CreateOutgoingForm />);

    await selectFarmerOption(farmerLabel);

    const farmerInput = document.getElementById('outgoing-farmer');
    expect(farmerInput).toHaveTextContent(farmerLabel);

    await user.click(screen.getByRole('button', { name: /reset form/i }));

    expect(farmerInput).toHaveTextContent(/search farmers/i);
  });

  it('passes multi-optional variety filter mode to the gate pass section', async () => {
    const farmerLabel = 'Rajesh Kumar — Acct #101';
    renderWithProviders(<CreateOutgoingForm />);

    await selectFarmerOption(farmerLabel);

    expect(mockTransferGatePassesSection).toHaveBeenCalledWith(
      expect.objectContaining({ varietyFilterMode: 'multi-optional' }),
    );
  });

  it('omits remarks from the create payload when remarks are cleared before submit', async () => {
    const farmerLabel = 'Rajesh Kumar — Acct #101';
    const { queryClient } = renderWithProviders(<CreateOutgoingForm />);

    await selectFarmerOption(farmerLabel);
    seedIncomingPasses(queryClient);
    await user.click(screen.getByTestId('set-allocation'));

    const remarksField = screen.getByPlaceholderText(
      /add any additional comments or observations/i,
    );
    await user.type(remarksField, 'Temporary remarks');
    await user.clear(remarksField);

    await user.click(screen.getByRole('button', { name: /review/i }));
    await screen.findByTestId('outgoing-summary');
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(mockCreateOutgoingGatePass).toHaveBeenCalledTimes(1);
    });

    const payload = mockCreateOutgoingGatePass.mock.calls[0]?.[0];
    expect(payload).not.toHaveProperty('remarks');
  });
});
