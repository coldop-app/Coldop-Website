import { Link } from '@tanstack/react-router';
import { Minus, SlidersHorizontal, User, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Route as settingsPreferencesRoute } from '@/routes/_authenticated/settings.preferences';
import { Route as settingsProfileRoute } from '@/routes/_authenticated/settings.profile';

type SettingsSection = {
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: string;
  to: typeof settingsProfileRoute.to | typeof settingsPreferencesRoute.to;
};

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    label: 'Account',
    title: 'Profile Settings',
    description: 'Update your name, contact details, and account information',
    icon: User,
    status: 'Manage profile',
    to: settingsProfileRoute.to,
  },
  {
    label: 'Application',
    title: 'Preferences',
    description: 'Theme, language, and display options for the app',
    icon: SlidersHorizontal,
    status: 'Customize app',
    to: settingsPreferencesRoute.to,
  },
];

function SettingsCard({ section }: { section: SettingsSection }) {
  const Icon = section.icon;

  return (
    <Link
      to={section.to}
      preload="intent"
      aria-label={`${section.title} — ${section.description}`}
      className="focus-visible:ring-ring/30 block rounded-4xl focus-visible:ring-2 focus-visible:outline-none"
    >
      <Card size="sm" className="card-hover gap-0 overflow-hidden">
        {/* Header Section */}
        <CardHeader
          className={cn(
            'flex flex-row items-center justify-between gap-3 pt-4 pb-4',
            'bg-muted/30 group-hover/card:bg-muted/40 transition-colors duration-200',
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <CardDescription
              className={cn(
                'text-xs font-medium tracking-wider uppercase',
                'group-hover/card:text-foreground/70 transition-colors duration-200',
              )}
            >
              {section.label}
            </CardDescription>
            <h3 className="font-heading text-foreground text-lg font-semibold tracking-tight">
              {section.title}
            </h3>
          </div>

          <div
            className={cn(
              'bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg',
              'group-hover/card:bg-primary/15 transition-colors duration-200',
            )}
          >
            <Icon
              className="text-primary size-5 transition-transform duration-200 group-hover/card:scale-110"
              aria-hidden
            />
          </div>
        </CardHeader>

        {/* Content Section */}
        <CardContent className="flex flex-col gap-3 pt-4">
          <p className="text-muted-foreground text-sm leading-relaxed">{section.description}</p>

          <Badge
            variant="outline"
            className="bg-primary/5 text-primary/80 group-hover/card:bg-primary/10 group-hover/card:text-primary w-fit gap-1.5 border-transparent font-normal transition-colors duration-200"
          >
            <Minus className="size-3 shrink-0" aria-hidden />
            {section.status}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

const SettingsOverview = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SETTINGS_SECTIONS.map((section) => (
        <SettingsCard key={section.title} section={section} />
      ))}
    </div>
  );
};

export default SettingsOverview;
