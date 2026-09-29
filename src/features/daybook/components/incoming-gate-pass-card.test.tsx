import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { IncomingGatePassCard } from '@/features/daybook/components/incoming-gate-pass-card';
import { FARMER_LINK_ID, makeIncomingDaybookEntry } from '@/test/fixtures';
import { renderWithProviders, screen, user } from '@/test/test-utils';

const mockNavigate = vi.fn();
const mockGenerateQr = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/features/daybook/utils/generate-incoming-gate-pass-qr-pdf', () => ({
  generateIncomingGatePassQrPdf: (...args: unknown[]) => mockGenerateQr(...args),
}));

function renderCard(
  overrides: Parameters<typeof makeIncomingDaybookEntry>[0] = {},
  editSearch?: Parameters<typeof IncomingGatePassCard>[0]['editSearch'],
) {
  const entry = makeIncomingDaybookEntry(overrides);
  renderWithProviders(<IncomingGatePassCard entry={entry} editSearch={editSearch} />);
  return entry;
}

describe('IncomingGatePassCard edit navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('navigates to the edit page without origin search from daybook', async () => {
    const entry = renderCard();

    await user.click(screen.getByRole('button', { name: /^edit$/i }));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/incoming/$id',
      params: { id: entry._id },
      search: {},
    });
  });

  it('forwards farmer-profile origin search to the edit route', async () => {
    const entry = renderCard(
      {},
      { from: 'people', farmerId: FARMER_LINK_ID, name: 'Rajesh Kumar' },
    );

    await user.click(screen.getByRole('button', { name: /^edit$/i }));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/incoming/$id',
      params: { id: entry._id },
      search: { from: 'people', farmerId: FARMER_LINK_ID, name: 'Rajesh Kumar' },
    });
  });
});

describe('IncomingGatePassCard QR pdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateQr.mockResolvedValue(new Blob(['pdf']));
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:qr');
    vi.spyOn(window, 'open').mockImplementation(() => null);
    usePreferencesStore.setState({ preferences: null });
    useColdStorageStore.setState({
      coldStorage: {
        _id: 'store-1',
        preferencesId: 'prefs-1',
        name: 'Kapur Cold Store',
        address: 'Village X',
        mobileNumber: '9876543210',
        capacity: 1000,
        imageUrl: '',
        isPaid: true,
        isActive: true,
        plan: 'basic',
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
    });
  });

  it('prints a QR pdf for the gate pass and does not open the detail route', async () => {
    const entry = renderCard();

    await user.click(screen.getByRole('button', { name: /print qr code/i }));

    expect(mockGenerateQr).toHaveBeenCalledWith({
      gatePassId: entry._id,
      gatePassNo: entry.gatePassNo,
      farmerName: entry.farmerStorageLinkId.name,
      lotNo: '12/120',
      coldStorageName: 'Kapur Cold Store',
    });
    expect(mockNavigate).not.toHaveBeenCalledWith(
      expect.objectContaining({ to: '/incoming-gate-pass/$id' }),
    );
  });

  it('does not carry farmer-profile search into the QR pdf', async () => {
    const entry = renderCard(
      {},
      { from: 'people', farmerId: FARMER_LINK_ID, name: 'Rajesh Kumar' },
    );

    await user.click(screen.getByRole('button', { name: /print qr code/i }));

    expect(mockGenerateQr).toHaveBeenCalledWith({
      gatePassId: entry._id,
      gatePassNo: entry.gatePassNo,
      farmerName: entry.farmerStorageLinkId.name,
      lotNo: '12/120',
      coldStorageName: 'Kapur Cold Store',
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
