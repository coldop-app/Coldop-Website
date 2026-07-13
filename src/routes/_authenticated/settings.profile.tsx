import ProfileSettingsPage from '@/features/profile';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/profile')({
  component: ProfileSettingsPage,
});
