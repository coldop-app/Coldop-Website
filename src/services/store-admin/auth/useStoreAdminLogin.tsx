import { useMutation } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useStore } from '@/stores/store';
import queryClient from '@/lib/queryClient';

// API response type for logout
export interface StoreAdminLogoutApiResponse {
  success: boolean;
  message: string;
}

export const useStoreAdminLogout = () => {
  const navigate = useNavigate();
  const router = useRouter();
  const { clearAdminData, setLoading } = useStore();

  return useMutation<
    StoreAdminLogoutApiResponse,
    AxiosError<{ message?: string }>,
    void
  >({
    mutationKey: ['store-admin', 'logout'],

    mutationFn: async () => {
      setLoading(true);

      const { data } =
        await storeAdminAxiosClient.post<StoreAdminLogoutApiResponse>(
          '/store-admin/logout'
        );

      return data;
    },

    onSuccess: (data) => {
      setLoading(false);

      // Clear admin data from store
      clearAdminData();

      // So route beforeLoad sees updated auth context
      router.invalidate();

      // Clear all query cache
      queryClient.clear();

      toast.success(data.message || 'Logged out successfully!');

      // Redirect to login page
      navigate({
        to: '/store-admin/login',
        replace: true,
      });
    },

    onError: (error) => {
      setLoading(false);

      // Even if logout API fails, clear local data and redirect
      // This ensures user is logged out locally even if server request fails
      clearAdminData();
      router.invalidate();
      queryClient.clear();

      const errMsg =
        error.response?.data?.message || error.message || 'Logout failed';

      toast.error(errMsg);

      // Still redirect to login even on error
      navigate({
        to: '/store-admin/login',
        replace: true,
      });
    },
  });
};
