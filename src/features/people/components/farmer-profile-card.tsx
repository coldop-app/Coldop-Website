import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Boxes,
  MapPin,
  Pencil,
  Phone,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatInr } from '@/features/finances/shared/format-currency';
import { cn } from '@/lib/utils';

export type FarmerBagTotals = {
  incomingGatePasses: number;
  outgoingGatePasses: number;
  incomingBags: number;
  outgoingBags: number;
  transferIncomingBags: number;
  transferOutgoingBags: number;
};

type FarmerProfileCardProps = {
  displayName: string;
  accountLabel: string;
  costPerBag?: number;
  mobileNumber?: string;
  address?: string;
  bagTotals?: FarmerBagTotals;
  isLoadingTotals?: boolean;
  showFinances?: boolean;
  onEditClick?: () => void;
  onFinancesClick?: () => void;
  onStockLedgerClick?: () => void;
  onFinancialLedgerClick?: () => void;
  isFinancialLedgerDisabled?: boolean;
};

const bagCountFormatter = new Intl.NumberFormat('en-IN');

const PLACEHOLDER_BAG_TOTALS: FarmerBagTotals = {
  incomingGatePasses: 0,
  outgoingGatePasses: 0,
  incomingBags: 0,
  outgoingBags: 0,
  transferIncomingBags: 0,
  transferOutgoingBags: 0,
};

type BagStat = {
  label: string;
  gatePassKey: keyof Pick<FarmerBagTotals, 'incomingGatePasses' | 'outgoingGatePasses'>;
  bagKey: keyof Pick<FarmerBagTotals, 'incomingBags' | 'outgoingBags'>;
  transferKey: keyof Pick<FarmerBagTotals, 'transferIncomingBags' | 'transferOutgoingBags'>;
  icon: LucideIcon;
  tone: 'primary' | 'muted';
};

const BAG_STATS: BagStat[] = [
  {
    label: 'Incoming',
    gatePassKey: 'incomingGatePasses',
    bagKey: 'incomingBags',
    transferKey: 'transferIncomingBags',
    icon: ArrowDownLeft,
    tone: 'primary',
  },
  {
    label: 'Outgoing',
    gatePassKey: 'outgoingGatePasses',
    bagKey: 'outgoingBags',
    transferKey: 'transferOutgoingBags',
    icon: ArrowUpRight,
    tone: 'muted',
  },
];

function getInitials(name: string) {
  if (!name) return '';

  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function FarmerProfileCard({
  displayName,
  accountLabel,
  costPerBag,
  mobileNumber,
  address,
  bagTotals = PLACEHOLDER_BAG_TOTALS,
  isLoadingTotals = false,
  showFinances = true,
  onEditClick,
  onFinancesClick,
  onStockLedgerClick,
  onFinancialLedgerClick,
  isFinancialLedgerDisabled = false,
}: FarmerProfileCardProps) {
  const actions = [
    ...(showFinances
      ? [
          { label: 'Finances', icon: Wallet, onClick: onFinancesClick },
          {
            label: 'View Financial Ledger',
            icon: BookOpen,
            onClick: onFinancialLedgerClick,
            disabled: isFinancialLedgerDisabled,
          },
        ]
      : []),
    { label: 'View Stock Ledger', icon: Boxes, onClick: onStockLedgerClick },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary text-primary-foreground text-base font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-xl font-semibold" title={displayName}>
              {displayName}
            </CardTitle>

            <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Badge variant="secondary" className="font-normal tabular-nums">
                {accountLabel}
              </Badge>

              {typeof costPerBag === 'number' ? (
                <span className="text-foreground tabular-nums">
                  <span className="text-primary font-medium">{formatInr(costPerBag)}</span>
                  <span> / bag</span>
                </span>
              ) : null}

              {mobileNumber ? (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5 shrink-0" aria-hidden />
                  <span className="tabular-nums">{mobileNumber}</span>
                </span>
              ) : null}

              {address ? (
                <span
                  className="inline-flex max-w-full min-w-0 items-center gap-1.5 sm:max-w-xs"
                  title={address}
                >
                  <MapPin className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{address}</span>
                </span>
              ) : null}
            </CardDescription>
          </div>
        </div>

        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Edit farmer" onClick={onEditClick}>
            <Pencil aria-hidden />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={action.disabled}
              onClick={action.onClick}
            >
              <Icon className="text-primary" aria-hidden />
              {action.label}
            </Button>
          );
        })}
      </CardContent>

      <Separator />

      <CardFooter className="grid grid-cols-2 gap-4">
        {BAG_STATS.map((stat) => (
          <BagStatCell
            key={stat.gatePassKey}
            stat={stat}
            gatePassCount={bagTotals[stat.gatePassKey]}
            bagCount={bagTotals[stat.bagKey]}
            transferBagCount={bagTotals[stat.transferKey]}
            isLoading={isLoadingTotals}
          />
        ))}
      </CardFooter>
    </Card>
  );
}

function BagStatCell({
  stat,
  gatePassCount,
  bagCount,
  transferBagCount,
  isLoading,
}: {
  stat: BagStat;
  gatePassCount: number;
  bagCount: number;
  transferBagCount: number;
  isLoading: boolean;
}) {
  const Icon = stat.icon;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex size-8 items-center justify-center rounded-md',
            stat.tone === 'primary'
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-4" aria-hidden />
        </div>
        <span className="text-muted-foreground text-xs font-medium">{stat.label}</span>
      </div>

      <div className="text-foreground space-y-0.5 tabular-nums">
        <p className="text-sm font-medium">
          {isLoading ? '—' : `${bagCountFormatter.format(gatePassCount)} gate passes`}
        </p>
        <p className="text-muted-foreground text-sm">
          {isLoading ? '—' : `${bagCountFormatter.format(bagCount)} bags`}
        </p>
        <p className="text-muted-foreground text-sm">
          {isLoading ? '—' : `${bagCountFormatter.format(transferBagCount)} bags (internal)`}
        </p>
      </div>
    </div>
  );
}
