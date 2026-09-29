import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import type {
  IncomingGatePassDetail,
  IncomingGatePassDetailResponse,
} from '@/features/incoming/types/api';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const INCOMING_GATE_PASS_QUERY_KEY = ['incoming-gate-pass'] as const;

export function incomingGatePassQueryKey(id: string) {
  return [...INCOMING_GATE_PASS_QUERY_KEY, id] as const;
}

export function isIncomingGatePassNotFound(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 404;
  }

  if (error instanceof Error && error.cause) {
    return isIncomingGatePassNotFound(error.cause);
  }

  return false;
}

async function fetchIncomingGatePass(id: string): Promise<IncomingGatePassDetail> {
  try {
    const { data } = await apiClient.get<IncomingGatePassDetailResponse>(
      `/incoming-gate-pass/${id}`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Failed to load incoming gate pass');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load incoming gate pass'), {
      cause: error,
    });
  }
}

export function useIncomingGatePass(id: string) {
  const enabled = id.trim().length > 0;

  const query = useQuery({
    queryKey: incomingGatePassQueryKey(id),
    queryFn: () => fetchIncomingGatePass(id),
    enabled,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
