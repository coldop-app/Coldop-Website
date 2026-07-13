import { createFileRoute, redirect } from '@tanstack/react-router';

import FinancesPage from '@/features/finances/index';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { financesSearchSchema } from '@/features/finances/search';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';

export const Route = createFileRoute('/_authenticated/finances/')({
  validateSearch: financesSearchSchema,
  beforeLoad: () => {
    const showFinances = usePreferencesStore.getState().preferences?.showFinances ?? true;

    if (!showFinances) {
      throw redirect({ to: '/daybook', search: DEFAULT_DAYBOOK_SEARCH });
    }
  },
  component: FinancesPage,
});
