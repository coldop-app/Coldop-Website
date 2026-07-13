import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Route as settingsIndexRoute } from '@/routes/_authenticated/settings.index';

export function SettingsBackButton() {
  return (
    <Button variant="outline" size="sm" className="w-fit" asChild>
      <Link to={settingsIndexRoute.to}>
        <ArrowLeft className="size-4" />
        Back to Settings
      </Link>
    </Button>
  );
}
