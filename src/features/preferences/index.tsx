import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { usePreferences } from './api/use-preferences';
import { PreferencesError } from './components/preferences-error';
import { PreferencesSkeleton } from './components/preferences-skeleton';
import { SettingsBackButton } from '@/features/settings/components/settings-back-button';
import { PreferencesForm } from './components/preferences-form';

const PreferencesPage = () => {
  const { preferences, isLoading, isFetching, isError, error, refetch } = usePreferences();

  if (isLoading && !preferences) {
    return <PreferencesSkeleton />;
  }

  if (isError) {
    return (
      <PreferencesError error={error} onRetry={() => void refetch()} isRetrying={isFetching} />
    );
  }

  if (!preferences) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
        <SettingsBackButton />

        <header>
          <h1 className="font-heading text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
            Preferences
          </h1>
        </header>
        <Empty className="border-border border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No preferences found</EmptyTitle>
            <EmptyDescription>
              Preferences for your cold storage could not be found.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <PreferencesForm
      key={preferences.updatedAt}
      preferences={preferences}
      onRefresh={() => void refetch()}
      isRefreshing={isFetching}
    />
  );
};

export default PreferencesPage;
