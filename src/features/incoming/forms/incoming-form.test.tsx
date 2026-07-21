import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { IncomingForm } from '@/features/incoming/forms/incoming-form';
import type { IncomingFormApi } from '@/features/incoming/forms/use-incoming-form';
import { incomingDaybookEntryToFormValues } from '@/features/incoming/utils/incoming-daybook-entry-to-form-values';
import {
  FARMER_LINK_ID,
  GATE_PASS_ID,
  makeFarmerStorageLink,
  makeIncomingDaybookEntry,
  makePreferences,
  USER_ID,
} from '@/test/fixtures';
import {
  renderWithProviders,
  screen,
  selectComboboxOption,
  user,
  waitFor,
} from '@/test/test-utils';

const mockNavigate = vi.fn();
const mockCreateIncomingGatePass = vi.fn();
const mockUpdateIncomingGatePass = vi.fn();

const validQuantities = [
  {
    id: 'qty-1',
    size: '50kg',
    isExtra: false,
    qty: 10,
    bagType: 'JUTE' as const,
    chamber: 'A',
    floor: '1',
    row: '1',
    paltaiLocations: [],
  },
];

const validQuantitiesWithPaltai = [
  {
    ...validQuantities[0],
    paltaiLocations: [
      {
        id: 'paltai-1',
        chamber: 'B',
        floor: '2',
        row: '4',
      },
    ],
  },
];

const invalidPartialPaltaiQuantities = [
  {
    ...validQuantities[0],
    paltaiLocations: [
      {
        id: 'paltai-1',
        chamber: 'B',
        floor: '',
        row: '',
      },
    ],
  },
];

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/features/incoming/api/use-create-incoming-gate-pass', () => ({
  useCreateIncomingGatePass: () => ({
    mutateAsync: mockCreateIncomingGatePass,
  }),
}));

vi.mock('@/features/incoming/api/use-update-incoming-gate-pass', () => ({
  useUpdateIncomingGatePass: () => ({
    mutateAsync: mockUpdateIncomingGatePass,
  }),
}));

vi.mock('@/features/incoming/forms/incoming-quantities-section', () => ({
  IncomingQuantitiesSection: ({ form }: { form: IncomingFormApi }) => (
    <div>
      <button
        type="button"
        data-testid="set-incoming-quantities"
        onClick={() => form.setFieldValue('quantities', validQuantities)}
      >
        Set quantities
      </button>
      <button
        type="button"
        data-testid="set-incoming-quantities-with-paltai"
        onClick={() => form.setFieldValue('quantities', validQuantitiesWithPaltai)}
      >
        Set quantities with paltai
      </button>
      <button
        type="button"
        data-testid="set-incoming-quantities-with-partial-paltai"
        onClick={() => form.setFieldValue('quantities', invalidPartialPaltaiQuantities)}
      >
        Set quantities with partial paltai
      </button>
    </div>
  ),
}));

vi.mock('@/features/incoming/forms/incoming-summary-sheet', () => ({
  IncomingSummarySheet: ({ open, onSubmit }: { open: boolean; onSubmit: () => void }) =>
    open ? (
      <div data-testid="incoming-summary">
        <button type="button" onClick={onSubmit}>
          Confirm
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/people/components/add-farmer-dialog', () => ({
  AddFarmerDialog: () => null,
}));

vi.mock('@/features/auth/store/use-preferences-store', () => ({
  usePreferencesStore: (selector: (state: unknown) => unknown) =>
    selector({ preferences: makePreferences() }),
}));

vi.mock('@/features/auth/store/use-store-admin-store', () => ({
  useStoreAdminStore: (selector: (state: unknown) => unknown) =>
    selector({ storeAdmin: { _id: USER_ID, coldStorageId: 'cold-storage-1' } }),
}));

const handledSubmitRejections = new Set<string>();

beforeAll(() => {
  process.on('unhandledRejection', (reason: unknown) => {
    if (reason instanceof Error && handledSubmitRejections.has(reason.message)) {
      handledSubmitRejections.delete(reason.message);
    }
  });
});

function renderCreateForm() {
  return renderWithProviders(
    <IncomingForm
      mode="create"
      gatePassNo={42}
      gatePassNoReady
      userId={USER_ID}
      initialCommodity="Potato"
      initialBagSizes={['50kg']}
      farmerStorageLinks={[makeFarmerStorageLink()]}
      isFarmersLoading={false}
      isFarmersError={false}
      farmersError={null}
    />,
  );
}

function renderEditForm() {
  const entry = makeIncomingDaybookEntry();
  const preferences = makePreferences();
  const farmerLinks = [makeFarmerStorageLink()];
  const editValues = incomingDaybookEntryToFormValues({
    entry,
    commodities: preferences.commodities,
    farmerStorageLinks: farmerLinks,
    userId: USER_ID,
  });

  renderWithProviders(
    <IncomingForm
      mode="edit"
      gatePassId={GATE_PASS_ID}
      gatePassNo={entry.gatePassNo}
      gatePassNoReady
      userId={USER_ID}
      initialCommodity="Potato"
      initialBagSizes={['50kg']}
      editDefaultValues={editValues}
      editBaselineValues={editValues}
      originalBagSizes={entry.bagSizes ?? []}
      rentEntryVoucherId={entry.rentEntryVoucherId}
      farmerStorageLinks={farmerLinks}
      isFarmersLoading={false}
      isFarmersError={false}
      farmersError={null}
    />,
  );

  return { entry };
}

async function fillRequiredCreateFields() {
  await selectComboboxOption('create-incoming-farmer', 'Rajesh Kumar — Acct #101');
  await selectComboboxOption('create-incoming-variety', 'Kufri Jyoti');
  await user.click(screen.getByTestId('set-incoming-quantities'));
}

describe('IncomingForm optional field clearing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateIncomingGatePass.mockResolvedValue({ gatePassNo: 42 });
    mockUpdateIncomingGatePass.mockResolvedValue({ gatePassNo: 12 });
  });

  it('omits remarks from the create payload when remarks are cleared before submit', async () => {
    renderCreateForm();
    await fillRequiredCreateFields();

    const remarksField = screen.getByPlaceholderText(
      /add any additional comments or observations/i,
    );
    await user.type(remarksField, 'Temporary remarks');
    await user.clear(remarksField);

    await user.click(screen.getByRole('button', { name: /review/i }));
    await screen.findByTestId('incoming-summary');
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(mockCreateIncomingGatePass).toHaveBeenCalledTimes(1);
    });

    const payload = mockCreateIncomingGatePass.mock.calls[0]?.[0];
    expect(payload).toEqual(
      expect.objectContaining({
        farmerStorageLinkId: FARMER_LINK_ID,
        variety: 'Kufri Jyoti',
      }),
    );
    expect(payload).not.toHaveProperty('remarks');
  });

  it('sends empty remarks in the update payload when remarks are cleared on edit', async () => {
    renderEditForm();

    const remarksField = await screen.findByDisplayValue('Morning receipt');
    await user.clear(remarksField);

    await user.click(screen.getByRole('button', { name: /review changes/i }));
    await screen.findByTestId('incoming-summary');
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(mockUpdateIncomingGatePass).toHaveBeenCalledWith({
        id: GATE_PASS_ID,
        payload: { remarks: '' },
      });
    });
  });

  it('includes paltai location in the update payload when edited', async () => {
    renderEditForm();

    await user.click(screen.getByTestId('set-incoming-quantities-with-paltai'));
    await user.click(screen.getByRole('button', { name: /review changes/i }));
    await screen.findByTestId('incoming-summary');
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(mockUpdateIncomingGatePass).toHaveBeenCalledWith({
        id: GATE_PASS_ID,
        payload: expect.objectContaining({
          bagSizes: expect.arrayContaining([
            expect.objectContaining({
              paltaiLocation: [
                {
                  chamber: 'B',
                  floor: '2',
                  row: '4',
                },
              ],
            }),
          ]),
        }),
      });
    });
  });

  it('blocks submit when paltai location is partially filled', async () => {
    renderEditForm();

    await user.click(screen.getByTestId('set-incoming-quantities-with-partial-paltai'));
    await user.click(screen.getByRole('button', { name: /review changes/i }));

    expect(screen.queryByTestId('incoming-summary')).not.toBeInTheDocument();
    expect(mockUpdateIncomingGatePass).not.toHaveBeenCalled();
  });
});
