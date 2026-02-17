import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

/**
 * Query Client Configuration for ERP Software
 * Best practices for TanStack Query v5
 */

// Custom Query Cache with global error handling
const queryCache = new QueryCache({
  onError: (error, query) => {
    console.error(`Query error for key [${query.queryKey.join(', ')}]:`, error);

    // Handle specific HTTP status codes
    const status = (error as any)?.response?.status;

    if (status === 401) {
      // Unauthorized - handled by axios interceptor
      // Additional handling if needed (e.g., toast notification)
    } else if (status >= 500) {
      // Server errors - show user notification
      console.error('Server error occurred');
      // toast.error('Server error. Please try again later.');
    } else if (status === 404) {
      // Not found errors
      console.warn('Resource not found');
    }
  },
  onSuccess: (_data, _query) => {
    // Optional: Global success handling for queries
    // console.log(`Query succeeded for key [${query.queryKey.join(', ')}]`);
  },
});

// Custom Mutation Cache with global error/success handling
const mutationCache = new MutationCache({
  onError: (error, _variables, _context, _mutation) => {
    console.error('Mutation error:', error);

    const errorMessage =
      (error as any)?.response?.data?.message || 'Operation failed';
    console.error('Mutation failed:', errorMessage);

    // Show user-friendly error notification
    // toast.error(errorMessage);
  },
  onSuccess: (_data, _variables, _context, _mutation) => {
    // Optional: Global success notification for mutations
    // toast.success('Operation completed successfully');
  },
});

// Main Query Client with optimized settings for ERP
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Cache timing
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 30, // 30 minutes - unused data kept in cache (formerly cacheTime)

      // Refetch behavior
      refetchOnWindowFocus: false, // Avoid unnecessary refetches in ERP
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch on component mount if data is stale
      refetchInterval: false, // Disable automatic polling by default

      // Retry configuration - smart retry logic
      retry: (failureCount, error) => {
        const status = (error as any)?.response?.status;

        // Don't retry on client errors (4xx)
        if (status && status >= 400 && status < 500) {
          return false;
        }

        // Retry up to 3 times for server errors (5xx) or network errors
        return failureCount < 3;
      },

      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Error handling
      throwOnError: false, // Handle errors in components, not globally

      // Network mode
      networkMode: 'online', // Only run queries when online

      // Performance optimization
      structuralSharing: true, // Optimize re-renders by reusing unchanged data

      // Keep previous data while refetching
      placeholderData: (previousData: unknown) => previousData as unknown,
    },
    mutations: {
      // Retry configuration - mutations should generally not retry
      retry: false, // Don't retry mutations (POST/PUT/DELETE operations)

      // Network mode
      networkMode: 'online',

      // Error handling
      throwOnError: false,
    },
  },
});

/**
 * Utility function to invalidate multiple queries after mutations
 * @param queryKeys - Array of query keys to invalidate
 *
 * @example
 * invalidateQueries(['invoices', 'customers']);
 */
export const invalidateQueries = (queryKeys: string[]) => {
  queryKeys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
};

/**
 * Utility function for optimistic updates
 * @param queryKey - Query key to update
 * @param updater - Function to update the data
 * @returns Previous data for rollback
 *
 * @example
 * const context = await optimisticUpdate(['invoice', id], (old) => ({
 *   ...old,
 *   status: 'paid'
 * }));
 */
export const optimisticUpdate = async <T>(
  queryKey: unknown[],
  updater: (old: T | undefined) => T
) => {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey });

  // Snapshot previous value
  const previousData = queryClient.getQueryData<T>(queryKey);

  // Optimistically update
  queryClient.setQueryData(queryKey, updater);

  // Return context for rollback
  return { previousData };
};

/**
 * Utility function to prefetch data
 * @param queryKey - Query key
 * @param queryFn - Function to fetch data
 * @param options - Additional options
 *
 * @example
 * await prefetchQuery(['invoices'], () => fetchInvoices());
 */
export const prefetchQuery = <T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  options: Record<string, any> = {}
) => {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

/**
 * Utility function to set query data manually
 * @param queryKey - Query key
 * @param data - Data to set
 *
 * @example
 * setQueryData(['invoice', id], newInvoiceData);
 */
export const setQueryData = <T>(queryKey: unknown[], data: T) => {
  queryClient.setQueryData(queryKey, data);
};

/**
 * Utility function to get query data
 * @param queryKey - Query key
 * @returns Current query data
 *
 * @example
 * const invoice = getQueryData(['invoice', id]);
 */
export const getQueryData = <T>(queryKey: unknown[]): T | undefined => {
  return queryClient.getQueryData<T>(queryKey);
};

/**
 * Utility function to remove queries from cache
 * @param queryKeys - Array of query keys to remove
 *
 * @example
 * removeQueries(['old-data', 'temporary-cache']);
 */
export const removeQueries = (queryKeys: string[]) => {
  queryKeys.forEach((key) => {
    queryClient.removeQueries({ queryKey: [key] });
  });
};

export default queryClient;
