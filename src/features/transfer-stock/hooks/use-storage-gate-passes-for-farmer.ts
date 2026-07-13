import { useMemo } from 'react';

import { useIncomingGatePassesByFarmerLink } from '@/features/incoming/api/use-incoming-gate-passes-by-farmer-link';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';
import { incomingGatePassesToStorageGatePasses } from '@/features/transfer-stock/utils/incoming-gate-pass-to-storage-gate-pass';

type UseStorageGatePassesForFarmerResult = {
  data: StorageGatePass[];
  isLoading: boolean;
  error: Error | null;
};

export function useStorageGatePassesForFarmer(
  farmerStorageLinkId: string,
): UseStorageGatePassesForFarmerResult {
  const {
    data: records,
    isLoading,
    isError,
    error,
  } = useIncomingGatePassesByFarmerLink(farmerStorageLinkId);

  const data = useMemo(
    () =>
      farmerStorageLinkId.trim()
        ? incomingGatePassesToStorageGatePasses(records, farmerStorageLinkId)
        : [],
    [records, farmerStorageLinkId],
  );

  return {
    data,
    isLoading,
    error: isError
      ? error instanceof Error
        ? error
        : new Error('Failed to load gate passes')
      : null,
  };
}
