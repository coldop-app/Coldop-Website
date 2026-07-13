import { createFileRoute } from '@tanstack/react-router';
import CreateOutgoingForm from '@/features/outgoing/forms/create-outgoing-form';

export const Route = createFileRoute('/_authenticated/outgoing/')({
  component: CreateOutgoingForm,
});
