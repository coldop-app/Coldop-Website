import { createFileRoute } from '@tanstack/react-router';
import OutgoingForm from '@/components/forms/outgoing';

export const Route = createFileRoute('/store-admin/_authenticated/outgoing/')({
  component: OutgoingForm,
});
