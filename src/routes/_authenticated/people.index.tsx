import { createFileRoute } from '@tanstack/react-router';

import PeoplePage from '@/features/people';

export const Route = createFileRoute('/_authenticated/people/')({
  component: PeoplePage,
});
