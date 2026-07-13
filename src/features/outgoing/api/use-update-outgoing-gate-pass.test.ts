import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockPatch = vi.fn();

vi.mock('@/lib/api-client', () => ({
  default: {
    patch: (...args: unknown[]) => mockPatch(...args),
  },
  getApiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));

import { updateOutgoingGatePassRequest } from '@/features/outgoing/api/use-update-outgoing-gate-pass';
import { OUTGOING_GATE_PASS_ID } from '@/test/fixtures';

const updatedRecord = {
  _id: OUTGOING_GATE_PASS_ID,
  gatePassNo: 101,
  date: '2026-06-28T00:00:00.000Z',
  farmerStorageLinkId: {
    _id: '682b2245a3e03b66de157e00',
    name: 'Ram Singh',
    accountNumber: 1,
  },
};

describe('updateOutgoingGatePassRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PATCHes header-only changes', async () => {
    mockPatch.mockResolvedValue({
      data: {
        status: 'Success',
        message: 'Outgoing gate pass updated successfully.',
        data: updatedRecord,
      },
    });

    const payload = {
      truckNumber: 'HR-26-AB-1234',
      remarks: 'Updated truck number',
    };

    const result = await updateOutgoingGatePassRequest({
      id: OUTGOING_GATE_PASS_ID,
      payload,
    });

    expect(mockPatch).toHaveBeenCalledWith(`/outgoing-gate-pass/${OUTGOING_GATE_PASS_ID}`, payload);
    expect(result).toEqual(updatedRecord);
  });

  it('PATCHes allocation-only changes', async () => {
    mockPatch.mockResolvedValue({
      data: {
        status: 'Success',
        message: 'Outgoing gate pass updated successfully.',
        data: updatedRecord,
      },
    });

    const payload = {
      incomingGatePasses: [
        {
          incomingGatePassId: '682b2245a3e03b66de157001',
          variety: 'Chipsona',
          allocations: [
            {
              size: '50 kg',
              quantityToAllocate: 80,
              location: { chamber: 'A', floor: '1', row: 'R1' },
            },
          ],
        },
      ],
    };

    await updateOutgoingGatePassRequest({
      id: OUTGOING_GATE_PASS_ID,
      payload,
    });

    expect(mockPatch).toHaveBeenCalledWith(`/outgoing-gate-pass/${OUTGOING_GATE_PASS_ID}`, payload);
  });

  it('PATCHes combined header and allocation changes', async () => {
    mockPatch.mockResolvedValue({
      data: {
        status: 'Success',
        message: 'Outgoing gate pass updated successfully.',
        data: updatedRecord,
      },
    });

    const payload = {
      truckNumber: 'HR-26-XY-9999',
      to: 'Mandi Jaipur',
      incomingGatePasses: [
        {
          incomingGatePassId: '682b2245a3e03b66de157001',
          variety: 'Chipsona',
          allocations: [
            {
              size: '50 kg',
              quantityToAllocate: 30,
              location: { chamber: 'A', floor: '1', row: 'R1' },
            },
          ],
        },
      ],
    };

    await updateOutgoingGatePassRequest({
      id: OUTGOING_GATE_PASS_ID,
      payload,
    });

    expect(mockPatch).toHaveBeenCalledWith(`/outgoing-gate-pass/${OUTGOING_GATE_PASS_ID}`, payload);
  });

  it('throws with the API message on error responses', async () => {
    mockPatch.mockRejectedValue({
      response: {
        data: {
          status: 'error',
          statusCode: 400,
          errorCode: 'INSUFFICIENT_STOCK',
          message:
            'Insufficient quantity for size "50 kg" at location A/1/R1 in incoming gate pass 682b2245a3e03b66de157001: available 45 (current 20 + 25 from this pass), requested 80',
        },
      },
    });

    await expect(
      updateOutgoingGatePassRequest({
        id: OUTGOING_GATE_PASS_ID,
        payload: { truckNumber: 'HR-26-AB-1234' },
      }),
    ).rejects.toThrow('Failed to update outgoing gate pass');
  });

  it('throws when the success envelope is missing data', async () => {
    mockPatch.mockResolvedValue({
      data: {
        status: 'Success',
        message: 'Outgoing gate pass updated successfully.',
        data: null,
      },
    });

    await expect(
      updateOutgoingGatePassRequest({
        id: OUTGOING_GATE_PASS_ID,
        payload: { remarks: 'Updated' },
      }),
    ).rejects.toThrow('Failed to update outgoing gate pass');
  });
});
