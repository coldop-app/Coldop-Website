import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/use-auth-store';
import {
  fetchNextGatePassNumber,
  gatePassNumberQueryKey,
  type GatePassNumberType,
} from '@/lib/gate-pass-number';

export function useNextGatePassNumber(type: GatePassNumberType) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const query = useQuery({
    queryKey: gatePassNumberQueryKey(type),
    queryFn: () => fetchNextGatePassNumber(type),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  return {
    nextNumber: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
