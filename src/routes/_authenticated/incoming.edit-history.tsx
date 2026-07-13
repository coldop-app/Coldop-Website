import { createFileRoute } from '@tanstack/react-router';
import IncomingEditHistoryPage from '@/features/incoming-edit-history';
import { parseIncomingEditHistorySearch } from '@/features/incoming-edit-history/search';

export const Route = createFileRoute('/_authenticated/incoming/edit-history')({
  validateSearch: parseIncomingEditHistorySearch,
  component: IncomingEditHistoryPage,
});
