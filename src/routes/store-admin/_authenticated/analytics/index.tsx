import { createFileRoute } from '@tanstack/react-router';
import AnalyticsPage from '@/components/analytics';

export const Route = createFileRoute('/store-admin/_authenticated/analytics/')({
  component: AnalyticsPage,
});
