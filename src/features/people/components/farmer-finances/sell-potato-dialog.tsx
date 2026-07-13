import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { FarmerFinanceVoucherDialog } from '@/features/people/components/farmer-finances/farmer-finance-voucher-dialog';
import { useFarmerFinanceLedgers } from '@/features/people/components/farmer-finances/hooks/use-farmer-finance-ledgers';
import { TransferStockConfirmDialog } from '@/features/people/components/farmer-finances/transfer-stock-confirm-dialog';
import type { FarmerFinanceDialogProps } from '@/features/people/components/farmer-finances/types';
import { getMissingSellPotatoLedgers } from '@/features/people/components/farmer-finances/utils/get-missing-farmer-finance-ledgers';

type SellPotatoStep = 'confirm' | 'voucher';

export function SellPotatoDialog({
  open,
  onOpenChange,
  linkId,
  farmerName,
}: FarmerFinanceDialogProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<SellPotatoStep>('confirm');
  const { farmerLedger, potatoPurchaseLedger, isLoading } = useFarmerFinanceLedgers(linkId);

  useEffect(() => {
    if (!open) {
      setStep('confirm');
    }
  }, [open]);

  const missingLedgers = getMissingSellPotatoLedgers({
    debitLedger: farmerLedger,
    creditLedger: potatoPurchaseLedger,
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
        potatoAction: 'sell',
      },
    });
    handleDialogOpenChange(false);
  };

  return (
    <>
      <TransferStockConfirmDialog
        open={open && step === 'confirm'}
        onOpenChange={handleDialogOpenChange}
        title="Sell Potato"
        onContinueWithVoucher={() => setStep('voucher')}
        onTransferStock={handleTransferStock}
      />

      <FarmerFinanceVoucherDialog
        open={open && step === 'voucher'}
        onOpenChange={handleDialogOpenChange}
        title="Sell Potato"
        description={
          farmerName
            ? `Record a potato sale to ${farmerName}.`
            : 'Record a potato sale to this farmer.'
        }
        debitLedger={farmerLedger}
        creditLedger={potatoPurchaseLedger}
        isLoadingLedgers={isLoading}
        missingLedgers={missingLedgers}
        submitLabel="Sell Potato"
      />
    </>
  );
}
