import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import { OutgoingGatePassCard } from '@/features/daybook/components/outgoing-gate-pass-card';
import { makeOutgoingDaybookEntry, OUTGOING_GATE_PASS_ID, USER_ID } from '@/test/fixtures';
import { renderWithProviders, screen, user, waitFor } from '@/test/test-utils';

const mockNullOutgoingGatePass = vi.fn();
const mockNavigate = vi.fn();

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
  },
}));

vi.mock('@/features/outgoing/api/use-null-outgoing-gate-pass', () => ({
  useNullOutgoingGatePass: () => ({
    mutateAsync: mockNullOutgoingGatePass,
    isPending: false,
  }),
}));

function renderCard(overrides: Parameters<typeof makeOutgoingDaybookEntry>[0] = {}) {
  const entry = makeOutgoingDaybookEntry(overrides);
  renderWithProviders(<OutgoingGatePassCard entry={entry} />);
  return entry;
}

describe('OutgoingGatePassCard mark as null', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNullOutgoingGatePass.mockResolvedValue(undefined);
  });

  it('shows edit and mark-as-null actions for active entries', () => {
    renderCard();

    expect(
      screen.getByRole('button', { name: /mark outgoing gate pass 24 as null/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit outgoing gate pass 24/i })).toBeInTheDocument();
  });

  it('navigates to the edit page when edit is clicked', async () => {
    const entry = renderCard();

    await user.click(screen.getByRole('button', { name: /edit outgoing gate pass 24/i }));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/outgoing/$id',
      params: { id: entry._id },
    });
  });

  it('hides edit and mark-as-null actions for nulled entries', () => {
    renderCard({ isNull: true });

    expect(screen.getByText('Null')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /mark outgoing gate pass 24 as null/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /edit outgoing gate pass 24/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the confirmation dialog when Mark as null is clicked', async () => {
    renderCard();

    await user.click(screen.getByRole('button', { name: /mark outgoing gate pass 24 as null/i }));

    expect(
      await screen.findByRole('heading', { name: /mark ogp #24 as null/i }),
    ).toBeInTheDocument();
  });

  it('keeps confirm disabled until cancellation remarks are entered', async () => {
    renderCard();

    await user.click(screen.getByRole('button', { name: /mark outgoing gate pass 24 as null/i }));

    const confirmButton = await screen.findByRole('button', {
      name: /^mark as null$/i,
    });
    expect(confirmButton).toBeDisabled();

    const remarksField = screen.getByPlaceholderText(/issued in error — wrong truck and quantity/i);
    await user.type(remarksField, '   ');
    expect(confirmButton).toBeDisabled();

    await user.clear(remarksField);
    await user.type(remarksField, 'Issued in error');
    expect(confirmButton).toBeEnabled();
  });

  it('marks the gate pass as null with remarks and closes the dialog', async () => {
    const entry = renderCard();

    await user.click(screen.getByRole('button', { name: /mark outgoing gate pass 24 as null/i }));

    const remarksField = await screen.findByPlaceholderText(
      /issued in error — wrong truck and quantity/i,
    );
    await user.type(remarksField, 'Issued in error');

    await user.click(screen.getByRole('button', { name: /^mark as null$/i }));

    await waitFor(() => {
      expect(mockNullOutgoingGatePass).toHaveBeenCalledWith({
        id: OUTGOING_GATE_PASS_ID,
        payload: { remarks: 'Issued in error' },
      });
    });

    expect(toast.success).toHaveBeenCalledWith(
      `OGP #${entry.gatePassNo.toLocaleString('en-IN')} marked as null`,
      { position: 'bottom-right' },
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /mark ogp #24 as null/i }),
      ).not.toBeInTheDocument();
    });
  });

  it('shows an error toast when nulling fails', async () => {
    mockNullOutgoingGatePass.mockRejectedValue(new Error('Null failed'));

    renderCard();

    await user.click(screen.getByRole('button', { name: /mark outgoing gate pass 24 as null/i }));

    const remarksField = await screen.findByPlaceholderText(
      /issued in error — wrong truck and quantity/i,
    );
    await user.type(remarksField, 'Issued in error');
    await user.click(screen.getByRole('button', { name: /^mark as null$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Null failed', {
        position: 'bottom-right',
      });
    });

    expect(screen.getByRole('heading', { name: /mark ogp #24 as null/i })).toBeInTheDocument();
  });

  it('clears remarks when the dialog is dismissed', async () => {
    renderCard();

    await user.click(screen.getByRole('button', { name: /mark outgoing gate pass 24 as null/i }));

    const remarksField = await screen.findByPlaceholderText(
      /issued in error — wrong truck and quantity/i,
    );
    await user.type(remarksField, 'Issued in error');
    await user.click(screen.getByRole('button', { name: /keep active/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /mark ogp #24 as null/i }),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /mark outgoing gate pass 24 as null/i }));

    const reopenedRemarksField = await screen.findByPlaceholderText(
      /issued in error — wrong truck and quantity/i,
    );
    expect(reopenedRemarksField).toHaveValue('');
  });

  it('shows nulled-by metadata when expanded', async () => {
    renderCard({
      isNull: true,
      nulledBy: { _id: USER_ID, name: 'Null Operator' },
      nulledAt: '2026-06-21T12:00:00.000Z',
    });

    await user.click(screen.getByRole('button', { name: /view full details/i }));

    expect(await screen.findByText('Nulled by')).toBeInTheDocument();
    expect(screen.getByText('Null Operator')).toBeInTheDocument();
  });
});
