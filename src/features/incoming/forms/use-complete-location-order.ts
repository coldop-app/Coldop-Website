import {
  hasCompleteIncomingQuantityLocation,
  type IncomingQuantityRow,
} from '@/features/incoming/schemas/incoming-quantities-schema';
import { useCallback, useMemo, useRef } from 'react';

function locationSignature(quantities: IncomingQuantityRow[]): string {
  return quantities.map((row) => `${row.id}|${row.chamber}|${row.floor}|${row.row}`).join(';');
}

export function useCompleteLocationOrder(quantities: IncomingQuantityRow[]) {
  const orderRef = useRef<string[]>([]);

  const completeLocationOrder = useMemo(() => {
    let next = [...orderRef.current];

    for (const row of quantities) {
      if (hasCompleteIncomingQuantityLocation(row) && !next.includes(row.id)) {
        next.push(row.id);
      }
    }

    next = next.filter((id) => {
      const row = quantities.find((r) => r.id === id);
      return row != null && hasCompleteIncomingQuantityLocation(row);
    });

    orderRef.current = next;
    return next;
  }, [locationSignature(quantities)]);

  const resetCompletionOrder = useCallback(() => {
    orderRef.current = [];
  }, []);

  const sourceRow = quantities.find((row) => row.id === completeLocationOrder[0]);
  const canApplyToAll = sourceRow != null;

  return { sourceRow, canApplyToAll, resetCompletionOrder };
}
