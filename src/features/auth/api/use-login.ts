import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import { sanitizeRedirectPath } from '@/lib/seo/safe-redirect';
import { setLoginSession } from '../store/set-login-session';
import type { AuthResponse, LoginCredentials } from '../types';

async function loginRequest(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/store-admin/login', credentials);

    if (
      !data.success ||
      !data.data?.token ||
      !data.data.storeAdmin?._id ||
      !data.data.storeAdmin.coldStorageId?._id
    ) {
      throw new Error(data.message ?? 'Login failed');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Login failed'), { cause: error });
  }
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: ({ data }) => {
      if (!data) return;

      setLoginSession(data);

      const redirectTo = sanitizeRedirectPath(router.state.location.search.redirect);
      if (redirectTo) {
        router.history.push(redirectTo);
        return;
      }

      router.navigate({ to: '/daybook', search: DEFAULT_DAYBOOK_SEARCH });
    },
  });
}
