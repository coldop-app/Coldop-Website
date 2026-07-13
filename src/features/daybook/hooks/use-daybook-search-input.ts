import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Route } from '@/routes/_authenticated/daybook';

const SEARCH_DEBOUNCE_MS = 400;

export function useDaybookSearchInput(receiptNumber?: string) {
  const navigate = useNavigate({ from: Route.fullPath });
  const urlReceiptNumber = receiptNumber ?? '';
  const [draftQuery, setDraftQuery] = useState<string | null>(null);
  const lastNavigatedReceipt = useRef<string | undefined>(undefined);

  const query = draftQuery ?? urlReceiptNumber;
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (trimmed === urlReceiptNumber) return;

    lastNavigatedReceipt.current = trimmed || undefined;

    void navigate({
      replace: true,
      search: (prev) => ({
        ...prev,
        receiptNumber: trimmed || undefined,
        page: 1,
      }),
    });
  }, [debouncedQuery, navigate, urlReceiptNumber]);

  useEffect(() => {
    if (lastNavigatedReceipt.current === urlReceiptNumber) {
      lastNavigatedReceipt.current = undefined;
      return;
    }

    setDraftQuery(null);
  }, [urlReceiptNumber]);

  return { query, setDraftQuery };
}
