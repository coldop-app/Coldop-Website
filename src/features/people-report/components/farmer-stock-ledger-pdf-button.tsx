import { useState, useCallback } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import type { BuildFarmerStockLedgerPdfDataInput } from '@/features/people-report/utils/build-farmer-stock-ledger-pdf-data';
import { downloadBlob } from '@/lib/download-blob';

type FarmerStockLedgerPdfButtonProps = {
  getPdfBuildInput: () => BuildFarmerStockLedgerPdfDataInput | null;
  disabled?: boolean;
  variant?: 'default' | 'outline';
};

function openPdfBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const previewWindow = window.open(url, '_blank');

  if (!previewWindow) {
    URL.revokeObjectURL(url);
    downloadBlob(blob, filename);
    return;
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function FarmerStockLedgerPdfButton({
  getPdfBuildInput,
  disabled = false,
  variant = 'default',
}: FarmerStockLedgerPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const coldStorageName = useColdStorageStore((state) => state.coldStorage?.name);
  const coldStorageAddress = useColdStorageStore((state) => state.coldStorage?.address);
  const coldStorageLogo = useColdStorageStore((state) => state.coldStorage?.imageUrl);

  const handleOpenPdf = useCallback(async () => {
    const buildInput = getPdfBuildInput();
    if (!buildInput || !coldStorageName) {
      toast.error('Report data is not ready yet.');
      return;
    }

    try {
      setIsGenerating(true);

      const { generateFarmerStockLedgerPdf } =
        await import('@/features/people-report/utils/generate-farmer-stock-ledger-pdf');

      const blob = await generateFarmerStockLedgerPdf({
        ...buildInput,
        coldStorageName,
        coldStorageAddress,
        coldStorageLogo: coldStorageLogo || undefined,
      });

      const farmerName = buildInput.search.name?.trim() || 'farmer';
      const safeName = farmerName.replace(/[^\w.-]+/g, '_').slice(0, 40);
      openPdfBlob(blob, `${safeName}-stock-ledger.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [coldStorageAddress, coldStorageLogo, coldStorageName, getPdfBuildInput]);

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      className="min-w-0 shrink-0 gap-1.5"
      onClick={() => void handleOpenPdf()}
      disabled={disabled || isGenerating || !coldStorageName}
    >
      {isGenerating ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" />
          <span className="truncate">Generating…</span>
        </>
      ) : (
        <>
          <FileDown className="size-4 shrink-0" />
          <span className="truncate">PDF</span>
        </>
      )}
    </Button>
  );
}
