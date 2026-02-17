import { createFileRoute } from '@tanstack/react-router';
import PeoplePage from '@/components/people';

export const Route = createFileRoute('/store-admin/_authenticated/people/')({
  component: PeoplePage,
});
