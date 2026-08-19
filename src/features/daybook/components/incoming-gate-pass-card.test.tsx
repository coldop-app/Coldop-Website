import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IncomingGatePassCard } from '@/features/daybook/components/incoming-gate-pass-card';
import { FARMER_LINK_ID, makeIncomingDaybookEntry } from '@/test/fixtures';
import { renderWithProviders, screen, user } from '@/test/test-utils';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
