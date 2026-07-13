import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { FarmerFinanceVoucherDialog } from '@/features/people/components/farmer-finances/farmer-finance-voucher-dialog';
import { useFarmerFinanceLedgers } from '@/features/people/components/farmer-finances/hooks/use-farmer-finance-ledgers';
import { TransferStockConfirmDialog } from '@/features/people/components/farmer-finances/transfer-stock-confirm-dialog';
import type { FarmerFinanceDialogProps } from '@/features/people/components/farmer-finances/types';
import { getMissingBuyPotatoLedgers } from '@/features/people/components/farmer-finances/utils/get-missing-farmer-finance-ledgers';

type BuyPotatoStep = 'confirm' | 'voucher';

export function BuyPotatoDialog({
  open,
  onOpenChange,
  linkId,
  farmerName,
}: FarmerFinanceDialogProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<BuyPotatoStep>('confirm');
  const { farmerLedger, potatoPurchaseLedger, isLoading } = useFarmerFinanceLedgers(linkId);

  useEffect(() => {
    if (!open) {
      setStep('confirm');
    }
  }, [open]);

  const missingLedgers = getMissingBuyPotatoLedgers({
    debitLedger: potatoPurchaseLedger,
    creditLedger: farmerLedger,
  });

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep('confirm');
    }

    onOpenChange(nextOpen);
  };

  const handleTransferStock = () => {
    void navigate({
      to: '/transfer',
      search: {
        farmerLinkId: linkId,
        potatoAction: 'buy',
      },
    });
    handleDialogOpenChange(false);
  };

  return (
    <>
      <TransferStockConfirmDialog
        open={open && step === 'confirm'}
        onOpenChange={handleDialogOpenChange}
        title="Buy Potato"
        onContinueWithVoucher={() => setStep('voucher')}
        onTransferStock={handleTransferStock}
      />

      <FarmerFinanceVoucherDialog
        open={open && step === 'voucher'}
        onOpenChange={handleDialogOpenChange}
        title="Buy Potato"
        description={
          farmerName
            ? `Record a potato purchase from ${farmerName}.`
            : 'Record a potato purchase from this farmer.'
        }
        debitLedger={potatoPurchaseLedger}
        creditLedger={farmerLedger}
        isLoadingLedgers={isLoading}
        missingLedgers={missingLedgers}
        submitLabel="Buy Potato"
      />
    </>
  );
}
