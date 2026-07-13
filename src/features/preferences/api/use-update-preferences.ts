import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import type { UpdatePreferencesPayload, UpdatePreferencesResponse } from '../types';
import { PREFERENCES_QUERY_KEY } from './use-preferences';

async function updatePreferencesRequest(
  payload: UpdatePreferencesPayload,
): Promise<UpdatePreferencesResponse['data']> {
  try {
    const { data } = await apiClient.patch<UpdatePreferencesResponse>('/preferences/me', payload);

    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Failed to update preferences');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update preferences'), {
      cause: error,
    });
  }
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const setPreferences = usePreferencesStore((state) => state.setPreferences);

  return useMutation({
    mutationFn: updatePreferencesRequest,
    onSuccess: (data) => {
      if (!data) return;

      setPreferences(data);
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, data);
    },
  });
}
