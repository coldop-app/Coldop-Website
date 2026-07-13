import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type GatePassNumberType = 'incoming' | 'outgoing';

export interface GatePassNumberResponse {
  success: boolean;
  data?: {
    nextNumber: number;
  };
}

export function gatePassNumberQueryKey(type: GatePassNumberType) {
  return ['gate-pass-number', type] as const;
}

export async function fetchNextGatePassNumberApi(type: GatePassNumberType): Promise<number> {
  const { data } = await apiClient.get<GatePassNumberResponse>('/store-admin/gate-pass-number', {
    params: { type },
  });

  if (!data.success || data.data?.nextNumber == null) {
    throw new Error('Failed to load gate pass number');
  }

  return data.data.nextNumber;
}

export async function fetchNextGatePassNumber(type: GatePassNumberType): Promise<number> {
  try {
    return await fetchNextGatePassNumberApi(type);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load gate pass number'), {
      cause: error,
    });
  }
}
