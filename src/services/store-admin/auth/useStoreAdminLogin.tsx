import { useMutation } from '@tanstack/react-query';
import type {
  StoreAdminLoginInput,
  StoreAdminLoginApiResponse,
} from '@/types/store-admin';
import queryClient from '@/lib/queryClient';
import storeAdminAxiosClient from '@/lib/axios';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useStore } from '@/stores/store';
import type { ColdStorage } from '@/types/cold-storage';
import type { Preferences } from '@/types/preferences';

/** User-friendly message for login errors (wrong credentials, network, etc.) */
function getLoginErrorMessage(error: AxiosError<{ message?: string }>): string {
  const status = error.response?.status;
  const apiMessage = error.response?.data?.message;

  if (apiMessage && typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage.trim();
  }
  if (status === 401) {
    return 'Invalid mobile number or password. Please try again.';
  }
  if (status === 403) {
    return 'Access denied. Your account may be locked or inactive.';
  }
  if (status && status >= 500) {
    return 'Something went wrong on our end. Please try again later.';
  }
  if (
    error.code === 'ECONNABORTED' ||
    error.message?.toLowerCase().includes('timeout')
  ) {
    return 'Request timed out. Please check your connection and try again.';
  }
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Unable to connect. Please check your internet and try again.';
  }
  return 'Login failed. Please check your credentials and try again.';
}

export const useStoreAdminLogin = () => {
  const navigate = useNavigate();
  const search = useSearch({ from: '/store-admin/login/' });
  const { setAdminData, setLoading } = useStore();

  return useMutation<
    StoreAdminLoginApiResponse,
    AxiosError<{ message?: string }>,
    StoreAdminLoginInput
  >({
    mutationKey: ['store-admin', 'login'],

    mutationFn: async (payload) => {
      setLoading(true);

      const { data } =
        await storeAdminAxiosClient.post<StoreAdminLoginApiResponse>(
          '/store-admin/login',
          payload
        );

      return data;
    },

    onSuccess: (data) => {
      setLoading(false);

      if (!data.success || !data.data) {
        const message =
          (typeof data.message === 'string' && data.message.trim()) || null;
        toast.error(message || 'Invalid credentials. Please try again.');
        return;
      }

      const { storeAdmin, token } = data.data;

      // Preferences come from coldStorageId.preferencesId when populated by the API
      const preferencesFromApi =
        typeof storeAdmin.coldStorageId.preferencesId === 'object' &&
        storeAdmin.coldStorageId.preferencesId !== null
          ? storeAdmin.coldStorageId.preferencesId
          : undefined;

      // Transform the API response to match our StoreAdmin type
      // The API returns coldStorageId as an object, but our type expects it as a string
      const coldStorage: ColdStorage = {
        _id: storeAdmin.coldStorageId._id,
        name: storeAdmin.coldStorageId.name,
        address: storeAdmin.coldStorageId.address,
        mobileNumber: storeAdmin.coldStorageId.mobileNumber,
        capacity: storeAdmin.coldStorageId.capacity,
        imageUrl: storeAdmin.coldStorageId.imageUrl || '',
        isPaid: storeAdmin.coldStorageId.isPaid,
        isActive: storeAdmin.coldStorageId.isActive,
        plan: storeAdmin.coldStorageId.plan as ColdStorage['plan'],
        createdAt: storeAdmin.coldStorageId.createdAt,
        updatedAt: storeAdmin.coldStorageId.updatedAt,
        preferencesId:
          typeof storeAdmin.coldStorageId.preferencesId === 'object' &&
          storeAdmin.coldStorageId.preferencesId !== null &&
          '_id' in storeAdmin.coldStorageId.preferencesId
            ? storeAdmin.coldStorageId.preferencesId._id
            : typeof storeAdmin.coldStorageId.preferencesId === 'string'
              ? storeAdmin.coldStorageId.preferencesId
              : undefined,
      };

      // Create StoreAdmin with coldStorageId as string
      const admin = {
        _id: storeAdmin._id,
        coldStorageId: storeAdmin.coldStorageId._id,
        name: storeAdmin.name,
        mobileNumber: storeAdmin.mobileNumber,
        role: storeAdmin.role,
        isVerified: storeAdmin.isVerified,
        failedLoginAttempts: storeAdmin.failedLoginAttempts,
        lockedUntil: storeAdmin.lockedUntil,
        createdAt: storeAdmin.createdAt,
        updatedAt: storeAdmin.updatedAt,
      };

      // Normalise preferences (API may omit or use defaults)
      const prefs: Preferences | null = preferencesFromApi
        ? {
            _id: preferencesFromApi._id,
            commodities: preferencesFromApi.commodities ?? [],
            reportFormat: preferencesFromApi.reportFormat ?? 'default',
            showFinances: preferencesFromApi.showFinances ?? true,
            labourCost:
              typeof preferencesFromApi.labourCost === 'number'
                ? preferencesFromApi.labourCost
                : 0,
            customFields: preferencesFromApi.customFields,
            createdAt: preferencesFromApi.createdAt,
            updatedAt: preferencesFromApi.updatedAt,
          }
        : null;

      // Store admin + coldStorage + token + preferences
      setAdminData(admin, coldStorage, token, prefs);

      toast.success(data.message || 'Logged in successfully!');

      queryClient.invalidateQueries({ queryKey: ['store-admin', 'profile'] });

      // ✅ TanStack Router navigation - redirect to original destination or default
      const redirectTo =
        (search as { redirect?: string })?.redirect || '/store-admin/daybook';

      // If redirect is a full URL, use window.location, otherwise use router navigation
      if (redirectTo.startsWith('http')) {
        window.location.href = redirectTo;
      } else {
        navigate({
          to: redirectTo,
          replace: true,
        });
      }
    },

    onError: (error) => {
      setLoading(false);
      const errMsg = getLoginErrorMessage(error);
      toast.error(errMsg);
    },

    onSettled: () => {
      setLoading(false);
    },
  });
};
