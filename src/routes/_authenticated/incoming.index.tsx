import { createFileRoute } from '@tanstack/react-router';
import CreateIncomingForm from '@/features/incoming/forms/create-incoming-form';

export const Route = createFileRoute('/_authenticated/incoming/')({
  component: CreateIncomingForm,
});
