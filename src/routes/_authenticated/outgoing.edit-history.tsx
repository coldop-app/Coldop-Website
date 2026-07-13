import { createFileRoute } from '@tanstack/react-router';
import OutgoingEditHistoryPage from '@/features/outgoing-edit-history';
import { parseOutgoingEditHistorySearch } from '@/features/outgoing-edit-history/search';

export const Route = createFileRoute('/_authenticated/outgoing/edit-history')({
  validateSearch: parseOutgoingEditHistorySearch,
  component: OutgoingEditHistoryPage,
});
