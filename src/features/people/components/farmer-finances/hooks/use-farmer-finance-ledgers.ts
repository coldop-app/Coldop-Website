import { useMemo } from 'react';

import { useLedgers } from '@/features/finances/api/use-ledgers';
import {
  DISCOUNT_LEDGER_NAME,
  OTHER_INCOME_LEDGER_NAME,
  POTATO_PURCHASE_LEDGER_NAME,
} from '@/features/people/components/farmer-finances/ledger-names';
import { filterPaymentLedgers } from '@/features/people/components/farmer-finances/utils/filter-payment-ledgers';

export function useFarmerFinanceLedgers(linkId: string) {
  const { ledgers: allLedgers, isLoading: isLoadingAll } = useLedgers();
  const { ledgers: farmerLedgers, isLoading: isLoadingFarmer } = useLedgers({
    farmerStorageLinkId: linkId,
  });

  const farmerLedger = farmerLedgers[0] ?? null;

  const potatoPurchaseLedger = useMemo(
    () => allLedgers.find((ledger) => ledger.name === POTATO_PURCHASE_LEDGER_NAME) ?? null,
    [allLedgers],
  );

  const discountLedger = useMemo(
    () => allLedgers.find((ledger) => ledger.name === DISCOUNT_LEDGER_NAME) ?? null,
    [allLedgers],
  );

  const otherIncomeLedger = useMemo(
    () => allLedgers.find((ledger) => ledger.name === OTHER_INCOME_LEDGER_NAME) ?? null,
    [allLedgers],
  );

  const paymentLedgers = useMemo(() => filterPaymentLedgers(allLedgers), [allLedgers]);

  return {
    farmerLedger,
    potatoPurchaseLedger,
    discountLedger,
    otherIncomeLedger,
    paymentLedgers,
    isLoading: isLoadingAll || isLoadingFarmer,
  };
}
