import { createFileRoute, redirect } from '@tanstack/react-router';

import { LedgerStatementPage } from '@/features/finances/components/ledger-statement';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { ledgerStatementSearchSchema } from '@/features/finances/search';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';

export const Route = createFileRoute('/_authenticated/finances/ledgers/$id')({
  validateSearch: ledgerStatementSearchSchema,
  beforeLoad: () => {
    const showFinances = usePreferencesStore.getState().preferences?.showFinances ?? true;

    if (!showFinances) {
      throw redirect({ to: '/daybook', search: DEFAULT_DAYBOOK_SEARCH });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const search = Route.useSearch();

  return <LedgerStatementPage ledgerId={id} search={search} />;
}
