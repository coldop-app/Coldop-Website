import { useEffect, useRef } from 'react';
import { AlertCircle, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { PreferencesFormApi } from '../forms/use-preferences-form';

const TOAST_ID = 'preferences-unsaved-changes';

function showUnsavedToast(
  canSubmit: boolean,
  isSubmitting: boolean,
  isPending: boolean,
  onSave: () => void,
) {
  toast.custom(
    () => (
      <div className="border-border bg-popover text-popover-foreground flex w-[min(100vw-2rem,22rem)] flex-col gap-3 rounded-lg border p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="min-w-0 space-y-1">
            <p className="text-foreground text-sm font-medium">Unsaved changes</p>
            <p className="text-muted-foreground text-sm">
              Please click Save preferences to apply your changes.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-9 w-full gap-2"
          disabled={!canSubmit || isSubmitting || isPending}
          onClick={onSave}
        >
          {isSubmitting || isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          Save preferences
        </Button>
      </div>
    ),
    {
      id: TOAST_ID,
      duration: Infinity,
      position: 'bottom-right',
      unstyled: true,
      classNames: {
        toast: '!bg-transparent !border-0 !shadow-none !p-0',
      },
    },
  );
}

type PreferencesUnsavedToastEffectProps = {
  isDirty: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  isPending: boolean;
  onSave: () => void;
};

function PreferencesUnsavedToastEffect({
  isDirty,
  canSubmit,
  isSubmitting,
  isPending,
  onSave,
}: PreferencesUnsavedToastEffectProps) {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!isDirty) {
      toast.dismiss(TOAST_ID);
      return;
    }

    showUnsavedToast(canSubmit, isSubmitting, isPending, () => {
      void onSaveRef.current();
    });
  }, [isDirty, canSubmit, isSubmitting, isPending]);

  useEffect(() => {
    return () => {
      toast.dismiss(TOAST_ID);
    };
  }, []);

  return null;
}

type PreferencesUnsavedToastProps = {
  form: PreferencesFormApi;
  isPending: boolean;
};

export function PreferencesUnsavedToast({ form, isPending }: PreferencesUnsavedToastProps) {
  return (
    <form.Subscribe
      selector={(state) => ({
        isDirty: state.isDirty,
        canSubmit: state.canSubmit,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ isDirty, canSubmit, isSubmitting }) => (
        <PreferencesUnsavedToastEffect
          isDirty={isDirty}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          isPending={isPending}
          onSave={() => void form.handleSubmit()}
        />
      )}
    </form.Subscribe>
  );
}
