import { useEffect } from 'react';
import { toast } from 'sonner';
import { useStore } from '@/stores/store';

const PAYMENT_REMINDER_TOAST_ID = 'payment-reminder';
const PAYMENT_REMINDER_SHOWN_KEY = 'payment-reminder-shown';

const PAYMENT_REMINDER_MESSAGE =
  'This is a gentle reminder that your payment is due. Kindly complete the payment on or before 10th March 2026 to ensure uninterrupted access to our services. If you have already made the payment, contact our support team for confirmation. +91 98770 69258';
/**
 * Shows a one-time Sonner toast when the current cold storage has isPaid === false.
 * Dismisses automatically after 30s or when the user closes it. Only shown once per session.
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

    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(PAYMENT_REMINDER_SHOWN_KEY)) {
      return;
    }

    sessionStorage.setItem(PAYMENT_REMINDER_SHOWN_KEY, '1');

    toast.warning(PAYMENT_REMINDER_MESSAGE, {
      id: PAYMENT_REMINDER_TOAST_ID,
      duration: 30_000,
      position: 'top-right',
    });
  }, [hasHydrated, coldStorage]);

  return null;
}
