import { SettingsBackButton } from '@/features/settings/components/settings-back-button';
import { Skeleton } from '@/components/ui/skeleton';

function PreferencesCardSkeleton() {
  return (
    <div className="border-border flex flex-col gap-4 rounded-2xl border p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function PreferencesSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <SettingsBackButton />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <PreferencesCardSkeleton />
      <PreferencesCardSkeleton />
      <PreferencesCardSkeleton />
    </div>
  );
}
