import { Building2, Warehouse } from 'lucide-react';
import { BASE_OPERATORS, ENTERPRISE_PARTNERS } from '../data';

type ClientItem = { name: string; logo: string };

function ClientChip({
  client,
  variant = 'base',
}: {
  client: ClientItem;
  variant?: 'enterprise' | 'base';
}) {
  const isEnterprise = variant === 'enterprise';

  if (isEnterprise) {
    return (
      <div className="flex items-center justify-center px-4 py-2" title={client.name}>
        {client.logo ? (
          <img
            src={client.logo}
            alt={client.name}
            width={224}
            height={80}
            loading="lazy"
            decoding="async"
            className="h-16 w-auto max-w-[14rem] object-contain mix-blend-multiply sm:h-20 sm:max-w-[16rem] dark:mix-blend-screen"
          />
        ) : (
          <Building2 className="text-primary size-10 shrink-0" aria-hidden />
        )}
      </div>
    );
  }

  return (
    <div className="bg-card flex items-center gap-2.5 rounded-lg border px-4 py-2.5 whitespace-nowrap">
      {client.logo ? (
        <img
          src={client.logo}
          alt=""
          width={24}
          height={24}
          loading="lazy"
          decoding="async"
          className="size-6 object-contain"
        />
      ) : (
        <Warehouse className="text-primary size-4 shrink-0" aria-hidden />
      )}
      <span className="text-sm font-semibold">{client.name}</span>
    </div>
  );
}

function OperatorTrack({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div aria-hidden={ariaHidden} className="flex shrink-0 items-center gap-4 pr-4">
      {BASE_OPERATORS.map((client) => (
        <ClientChip key={client.name} client={client} variant="base" />
      ))}
    </div>
  );
}

export function Clients() {
  return (
    <section
      aria-labelledby="clients-heading"
      className="bg-muted/30 overflow-hidden border-y py-10"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <h2
          id="clients-heading"
          data-reveal
          className="text-muted-foreground text-center text-xs font-semibold tracking-widest uppercase"
        >
          Trusted across multiple cold storages
        </h2>

        {/* Enterprise Partners — curated, static */}
        <div data-reveal aria-label="Enterprise Partners" className="space-y-4">
          <p className="text-muted-foreground text-center text-xs font-semibold tracking-widest uppercase">
            Enterprises
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {ENTERPRISE_PARTNERS.map((client) => (
              <ClientChip key={client.name} client={client} variant="enterprise" />
            ))}
          </div>
        </div>

        <div aria-hidden className="border-border/60 border-t" />

        {/* Base Operators — network marquee */}
        <div aria-label="Base Operators" className="space-y-4">
          <p
            data-reveal
            className="text-muted-foreground text-center text-xs font-semibold tracking-widest uppercase"
          >
            Cold Storages
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="animate-marquee flex w-max motion-reduce:animate-none">
              <OperatorTrack />
              <OperatorTrack ariaHidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
