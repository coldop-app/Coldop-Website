import { createFileRoute } from '@tanstack/react-router';

import DaybookPage from '@/features/daybook';
import { parseDaybookSearch } from '@/features/daybook/search';

export const Route = createFileRoute('/_authenticated/daybook')({
  validateSearch: parseDaybookSearch,
  component: DaybookPage,
});
