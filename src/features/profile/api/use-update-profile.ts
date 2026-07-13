import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncProfileToStores } from '@/features/auth/store/sync-profile-to-stores';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import type { ProfileData, UpdateProfilePayload, UpdateProfileResponse } from '../types';
import { PROFILE_QUERY_KEY } from './use-profile';

async function updateProfileRequest(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  try {
    const { data } = await apiClient.put<UpdateProfileResponse>('/store-admin/profile', payload);

    if (!data.success || !data.data) {
      throw new Error(data.message ?? 'Failed to update profile');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update profile'), {
      cause: error,
    });
  }
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: (response) => {
      const data = response.data;
      if (!data) return;

      syncProfileToStores(data);
      queryClient.setQueryData<ProfileData>(PROFILE_QUERY_KEY, data);
    },
  });
}
