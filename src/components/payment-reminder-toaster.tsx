import { useEffect } from 'react';
import { toast } from 'sonner';
import { useStore } from '@/stores/store';

const PAYMENT_REMINDER_TOAST_ID = 'payment-reminder';

const PAYMENT_REMINDER_MESSAGE =
  'This is a gentle reminder that your payment is due. Kindly complete the payment on or before 10th March 2026 to ensure uninterrupted access to our services. If you have already made the payment, contact our support team for confirmation. +91 98770 69258';
/**
 * Shows a persistent Sonner toast when the current cold storage has isPaid === false.
 */
export function PaymentReminderToaster() {
  const coldStorage = useStore((s) => s.coldStorage);
  const hasHydrated = useStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!coldStorage || coldStorage.isPaid) {
      toast.dismiss(PAYMENT_REMINDER_TOAST_ID);
      return;
    }

    toast.warning(PAYMENT_REMINDER_MESSAGE, {
      id: PAYMENT_REMINDER_TOAST_ID,
      duration: Number.POSITIVE_INFINITY,
    });
  }, [hasHydrated, coldStorage]);

  return null;
}
