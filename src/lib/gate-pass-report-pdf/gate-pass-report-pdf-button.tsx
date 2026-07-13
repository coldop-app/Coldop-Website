import { useCallback, useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import type { GatePassReportPdfData } from '@/lib/gate-pass-report-pdf/types';

type GatePassReportPdfButtonProps = {
  getPdfData: () => GatePassReportPdfData | null;
  disabled?: boolean;
  variant?: 'default' | 'outline';
};

export function GatePassReportPdfButton({
  getPdfData,
  disabled = false,
  variant = 'outline',
}: GatePassReportPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const coldStorageName = useColdStorageStore((state) => state.coldStorage?.name);
  const coldStorageAddress = useColdStorageStore((state) => state.coldStorage?.address);
  const coldStorageLogo = useColdStorageStore((state) => state.coldStorage?.imageUrl);

  const handleOpenPdf = useCallback(async () => {
    if (!coldStorageName) {
      toast.error('Report data is not ready yet.', {
        position: 'bottom-right',
      });
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const pdfData = getPdfData();
      if (!pdfData) {
        toast.error('Report data is not ready yet.', {
          position: 'bottom-right',
        });
        return;
      }

      const { generateGatePassReportPdf } =
        await import('@/lib/gate-pass-report-pdf/generate-gate-pass-report-pdf');

      const blob = await generateGatePassReportPdf({
        ...pdfData,
        coldStorageName,
        coldStorageAddress,
        coldStorageLogo: coldStorageLogo || undefined,
      });

      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF. Please try again.', {
        position: 'bottom-right',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [coldStorageAddress, coldStorageLogo, coldStorageName, getPdfData]);

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
