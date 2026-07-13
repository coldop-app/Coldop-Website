import { useMutation } from '@tanstack/react-query';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { router } from '@/router';
import { clearSession } from '../store/clear-session';
import type { LogoutResponse } from '../types';

async function logoutRequest(): Promise<LogoutResponse> {
  try {
    const { data } = await apiClient.post<LogoutResponse>('/store-admin/logout');

    if (!data.success) {
      throw new Error(data.message ?? 'Logout failed');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Logout failed'), { cause: error });
  }
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      clearSession();
      void router.navigate({ to: '/', replace: true });
    },
  });
}
