import { createFileRoute } from '@tanstack/react-router';
import DaybookPage from '@/components/daybook';

export const Route = createFileRoute('/store-admin/_authenticated/daybook/')({
  component: DaybookPage,
});
