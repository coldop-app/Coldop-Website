import { createFileRoute } from '@tanstack/react-router';
import PreferencesPage from '@/features/preferences';

export const Route = createFileRoute('/_authenticated/settings/preferences')({
  component: PreferencesPage,
});
